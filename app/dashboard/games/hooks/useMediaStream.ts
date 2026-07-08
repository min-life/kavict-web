import { useState, useEffect, useCallback } from 'react';
import { webrtcService } from '../services/webrtcService';
import { updatePlayerMediaState } from '../services/roomService';

export const useMediaStream = (roomCode: string | null, userId: string | undefined) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);

  useEffect(() => {
    // We start with an empty stream so WebRTC can still connect.
    // The user has to click the buttons to actually turn on hardware.
    const stream = new MediaStream();
    setLocalStream(stream);

    return () => {
      stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const toggleCamera = useCallback(async () => {
    if (isCameraOn) {
      // Turn off
      webrtcService.replaceVideoTrack(null); // This stops the track and removes it
      setIsCameraOn(false);
      if (roomCode && userId) updatePlayerMediaState(roomCode, userId, false, isMicOn);
    } else {
      // Turn on
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = stream.getVideoTracks()[0];
        webrtcService.replaceVideoTrack(videoTrack);
        setIsCameraOn(true);
        if (roomCode && userId) updatePlayerMediaState(roomCode, userId, true, isMicOn);
      } catch (error) {
        console.error("Error accessing camera", error);
      }
    }
  }, [isCameraOn, isMicOn, roomCode, userId]);

  const toggleMic = useCallback(async () => {
    if (isMicOn) {
      // Turn off
      webrtcService.replaceAudioTrack(null);
      setIsMicOn(false);
      if (roomCode && userId) updatePlayerMediaState(roomCode, userId, isCameraOn, false);
    } else {
      // Turn on
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioTrack = stream.getAudioTracks()[0];
        webrtcService.replaceAudioTrack(audioTrack);
        setIsMicOn(true);
        if (roomCode && userId) updatePlayerMediaState(roomCode, userId, isCameraOn, true);
      } catch (error) {
        console.error("Error accessing microphone", error);
      }
    }
  }, [isMicOn, isCameraOn, roomCode, userId]);

  return { localStream, isCameraOn, isMicOn, toggleCamera, toggleMic };
};
