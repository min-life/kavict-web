import { useState, useEffect, useRef, useCallback } from 'react';
import { webrtcService } from '../services/webrtcService';
import { GameRoom } from '../services/roomService';
import { useAuth } from '@/contexts/AuthContext';

export const useWebRTC = (room: GameRoom | null, localStream: MediaStream | null) => {
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const { user } = useAuth();
  const isInitialized = useRef(false);
  const connectedPeers = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!room || !user || !localStream) return;

    if (!isInitialized.current) {
      webrtcService.init(
        room.code,
        user.uid,
        localStream,
        (userId, stream) => {
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.set(userId, stream);
            return newMap;
          });
        },
        (userId) => {
          setRemoteStreams(prev => {
            const newMap = new Map(prev);
            newMap.delete(userId);
            return newMap;
          });
          connectedPeers.current.delete(userId);
        }
      );
      isInitialized.current = true;
    }

    // Connect to all players in the room (mesh topology)
    if (room.players) {
      const playerIds = Object.keys(room.players);
      playerIds.forEach(playerId => {
        if (playerId !== user.uid && !connectedPeers.current.has(playerId)) {
          connectedPeers.current.add(playerId);
          if (user.uid < playerId) {
            webrtcService.connectToPeer(playerId);
          }
        }
      });
      
      // Cleanup disconnected peers
      connectedPeers.current.forEach(peerId => {
        if (!room.players[peerId]) {
          webrtcService.removePeer(peerId);
          connectedPeers.current.delete(peerId);
        }
      });
    }

    return () => {
      // Don't close all on every render, only handle on unmount of the game play view.
      // This cleanup runs when the component using this hook unmounts.
    };
  }, [room, user, localStream]);
  
  // Expose a way to explicitly close connections when leaving the game
  const cleanupWebRTC = useCallback(() => {
    webrtcService.closeAll();
    isInitialized.current = false;
    connectedPeers.current.clear();
    setRemoteStreams(new Map());
  }, []);

  return { remoteStreams, cleanupWebRTC };
};
