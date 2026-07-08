import { ref, set, onValue, remove, push, child, onChildAdded, get } from "firebase/database";
import { rtdb } from "@/lib/firebase";

export const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

type PeerConnectionMap = Map<string, RTCPeerConnection>;

class WebRTCService {
  private peerConnections: PeerConnectionMap = new Map();
  private localStream: MediaStream | null = null;
  private roomCode: string | null = null;
  private localUserId: string | null = null;
  private onRemoteStreamAdded: ((userId: string, stream: MediaStream) => void) | null = null;
  private onRemoteStreamRemoved: ((userId: string) => void) | null = null;

  init(
    roomCode: string,
    localUserId: string,
    stream: MediaStream,
    onStreamAdded: (userId: string, stream: MediaStream) => void,
    onStreamRemoved: (userId: string) => void
  ) {
    this.roomCode = roomCode;
    this.localUserId = localUserId;
    this.localStream = stream;
    this.onRemoteStreamAdded = onStreamAdded;
    this.onRemoteStreamRemoved = onStreamRemoved;
    
    this.listenForOffers();
    this.listenForAnswers();
    this.listenForICECandidates();
  }

  // Create a connection ID that is consistent for both peers (smaller ID first)
  private getConnectionId(peer1: string, peer2: string) {
    return peer1 < peer2 ? `${peer1}_${peer2}` : `${peer2}_${peer1}`;
  }

  private createPeerConnection(remoteUserId: string, isInitiator: boolean = false): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    if (isInitiator) {
      // Pre-negotiate transceivers only if we are initiating the offer
      pc.addTransceiver('audio', { direction: 'sendrecv' });
      pc.addTransceiver('video', { direction: 'sendrecv' });
      this.attachLocalTracks(pc);
    }

    // Handle remote tracks
    pc.ontrack = (event) => {
      // Create a fresh stream from the existing receivers' tracks to trigger React state updates
      const activeTracks = pc.getReceivers().map(r => r.track).filter(Boolean);
      const newRemoteStream = new MediaStream(activeTracks);
      
      if (this.onRemoteStreamAdded) {
        this.onRemoteStreamAdded(remoteUserId, newRemoteStream);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.roomCode && this.localUserId) {
        const connectionId = this.getConnectionId(this.localUserId, remoteUserId);
        const candidatesRef = ref(rtdb, `gameSignaling/${this.roomCode}/iceCandidates/${connectionId}/${this.localUserId}`);
        push(candidatesRef, event.candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        if (this.onRemoteStreamRemoved) {
          this.onRemoteStreamRemoved(remoteUserId);
        }
      }
    };

    this.peerConnections.set(remoteUserId, pc);
    return pc;
  }

  private attachLocalTracks(pc: RTCPeerConnection) {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        const kind = track.kind;
        const sender = pc.getSenders().find(s => s.track?.kind === kind || (!s.track && s.track === null && pc.getTransceivers().find(t => t.sender === s)?.receiver.track.kind === kind));
        if (sender) {
          sender.replaceTrack(track);
        } else {
          // If no matching sender is found, add the track normally
          pc.addTrack(track, this.localStream!);
        }
      });
    }
  }

  async connectToPeer(remoteUserId: string) {
    if (this.peerConnections.has(remoteUserId)) return;
    
    const pc = this.createPeerConnection(remoteUserId, true);
    
    if (this.roomCode && this.localUserId) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      const connectionId = this.getConnectionId(this.localUserId, remoteUserId);
      const offerRef = ref(rtdb, `gameSignaling/${this.roomCode}/offers/${connectionId}`);
      
      await set(offerRef, {
        sdp: offer.sdp,
        type: offer.type,
        sender: this.localUserId,
        receiver: remoteUserId
      });
    }
  }

  private listenForOffers() {
    const roomCode = this.roomCode;
    const localUserId = this.localUserId;
    if (!roomCode || !localUserId) return;

    const offersRef = ref(rtdb, `gameSignaling/${roomCode}/offers`);
    
    onChildAdded(offersRef, async (snapshot) => {
      const offerData = snapshot.val();
      if (offerData.receiver === localUserId) {
        const remoteUserId = offerData.sender;
        let pc = this.peerConnections.get(remoteUserId);
        
        if (!pc) {
          pc = this.createPeerConnection(remoteUserId, false);
        }

        await pc.setRemoteDescription(new RTCSessionDescription({
          type: offerData.type,
          sdp: offerData.sdp
        }));

        // Attach local tracks to the newly created transceivers from the remote offer
        this.attachLocalTracks(pc);
        
        // Explicitly set transceiver direction to sendrecv so that we can add tracks later
        // without needing an SDP renegotiation (which we don't currently support)
        pc.getTransceivers().forEach(t => {
          if (t.direction === 'recvonly') {
            t.direction = 'sendrecv';
          }
        });

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        const connectionId = this.getConnectionId(localUserId, remoteUserId);
        const answerRef = ref(rtdb, `gameSignaling/${roomCode}/answers/${connectionId}`);
        
        await set(answerRef, {
          sdp: answer.sdp,
          type: answer.type,
          sender: localUserId,
          receiver: remoteUserId
        });
      }
    });
  }

  private listenForAnswers() {
    const roomCode = this.roomCode;
    const localUserId = this.localUserId;
    if (!roomCode || !localUserId) return;

    const answersRef = ref(rtdb, `gameSignaling/${roomCode}/answers`);
    
    onChildAdded(answersRef, async (snapshot) => {
      const answerData = snapshot.val();
      if (answerData.receiver === localUserId) {
        const remoteUserId = answerData.sender;
        const pc = this.peerConnections.get(remoteUserId);
        
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription({
            type: answerData.type,
            sdp: answerData.sdp
          }));
        }
      }
    });
  }

  private listenForICECandidates() {
    const roomCode = this.roomCode;
    const localUserId = this.localUserId;
    if (!roomCode || !localUserId) return;

    const candidatesRef = ref(rtdb, `gameSignaling/${roomCode}/iceCandidates`);
    
    onChildAdded(candidatesRef, (snapshot) => {
      const connectionId = snapshot.key;
      if (connectionId && connectionId.includes(localUserId)) {
        const remoteUserId = connectionId.replace(localUserId, '').replace('_', '');
        
        // Listen to candidates added by the remote peer
        const remoteCandidatesRef = child(candidatesRef, `${connectionId}/${remoteUserId}`);
        onChildAdded(remoteCandidatesRef, async (candidateSnapshot) => {
          const candidateData = candidateSnapshot.val();
          const pc = this.peerConnections.get(remoteUserId);
          if (pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidateData));
            } catch (e) {
              console.error("Error adding received ice candidate", e);
            }
          }
        });
      }
    });
  }

  removePeer(remoteUserId: string) {
    const pc = this.peerConnections.get(remoteUserId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(remoteUserId);
      if (this.onRemoteStreamRemoved) {
        this.onRemoteStreamRemoved(remoteUserId);
      }
    }
  }

  closeAll() {
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();
    this.roomCode = null;
    this.localUserId = null;
    this.localStream = null;
  }

  replaceVideoTrack(newTrack: MediaStreamTrack | null) {
    if (this.localStream) {
      const oldTrack = this.localStream.getVideoTracks()[0];
      if (oldTrack) {
        this.localStream.removeTrack(oldTrack);
        oldTrack.stop();
      }
      if (newTrack) {
        this.localStream.addTrack(newTrack);
      }
    }
    this.peerConnections.forEach(pc => {
      const transceiver = pc.getTransceivers().find(t => t.receiver.track.kind === 'video');
      if (transceiver) {
        transceiver.sender.replaceTrack(newTrack);
      }
    });
  }

  replaceAudioTrack(newTrack: MediaStreamTrack | null) {
    if (this.localStream) {
      const oldTrack = this.localStream.getAudioTracks()[0];
      if (oldTrack) {
        this.localStream.removeTrack(oldTrack);
        oldTrack.stop();
      }
      if (newTrack) {
        this.localStream.addTrack(newTrack);
      }
    }
    this.peerConnections.forEach(pc => {
      const transceiver = pc.getTransceivers().find(t => t.receiver.track.kind === 'audio');
      if (transceiver) {
        transceiver.sender.replaceTrack(newTrack);
      }
    });
  }
}

export const webrtcService = new WebRTCService();
