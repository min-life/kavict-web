import { useState, useEffect } from 'react';
import { GameRoom, subscribeToRoom, setupOnDisconnect, cancelOnDisconnect, leaveRoom } from '../services/roomService';
import { useAuth } from '@/features/auth/AuthProvider';

export const useGameRoom = (roomCode: string | null) => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const isHost = user && room ? room.hostId === user.uid : false;
  const isKicked = user && room ? !!room.kickedPlayers?.[user.uid] : false;

  useEffect(() => {
    if (!roomCode || !user) return;

    const unsubscribe = subscribeToRoom(roomCode, (roomData) => {
      setRoom(roomData);
    });

    return () => {
      unsubscribe();
    };
  }, [roomCode, user]);

  useEffect(() => {
    if (!roomCode || !user || !room) return;
    
    // Check if kicked
    if (isKicked) {
      setError("Bạn đã bị kick khỏi phòng.");
    }
  }, [room, isKicked, roomCode, user]);

  // We no longer use beforeunload to leave the room.
  // This allows the room and session to persist across page refreshes.
  // If the user actually closes the tab, Firebase's onDisconnect will handle removing their player object.

  useEffect(() => {
    if (!roomCode || !user || !room) return;
    setupOnDisconnect(roomCode, user.uid, isHost);

    return () => {
      cancelOnDisconnect(roomCode, user.uid, isHost);
    };
  }, [roomCode, user, isHost, room]); // We depend on isHost so it re-runs when room is loaded and host status is known

  return { room, isHost, error, isKicked, setRoomError: setError };
};
