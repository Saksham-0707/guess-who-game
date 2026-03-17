import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { Room, ServerToClientEvents, ClientToServerEvents } from '@/types/game';
import { toast } from 'sonner';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
  socket: GameSocket | null;
  room: Room | null;
  playerId: string | null;
  isConnected: boolean;
  createRoom: (playerName: string) => void;
  joinRoom: (roomCode: string, playerName: string) => void;
  startSetup: () => void;
  addCharacter: (name: string, imageUrl: string) => void;
  removeCharacter: (characterId: string) => void;
  finishSetup: () => void;
  selectCharacter: (characterId: string) => void;
  eliminateCharacter: (characterId: string) => void;
  restoreCharacter: (characterId: string) => void;
  guessCharacter: (characterId: string) => void;
  rematch: () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const [socket, setSocket] = useState<GameSocket | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {

    const s = io(SOCKET_URL, { autoConnect: true }) as GameSocket;

    setSocket(s);

    s.on('connect', () => {

      setIsConnected(true);

      // Always sync playerId with socket id
      if (s.id) {
        setPlayerId(s.id);
      }

    });

    s.on('disconnect', () => {

      setIsConnected(false);

    });

    s.on('room-updated', (updatedRoom) => {

      setRoom(updatedRoom);

      // Ensure playerId always stays synced
      if (s.id) {
        setPlayerId(s.id);
      }

    });

    s.on('error', (message) => {

      toast.error(message);

    });

    return () => {

      s.disconnect();

    };

  }, []);

  const createRoom = useCallback((playerName: string) => {

    socket?.emit('create-room', playerName);

  }, [socket]);

  const joinRoom = useCallback((roomCode: string, playerName: string) => {

    socket?.emit('join-room', { roomCode, playerName });

  }, [socket]);

  const startSetup = useCallback(() => {
    socket?.emit('start-setup');
  }, [socket]);

  const addCharacter = useCallback((name: string, imageUrl: string) => {

    socket?.emit('add-character', { name, imageUrl });

  }, [socket]);

  const removeCharacter = useCallback((characterId: string) => {

    socket?.emit('remove-character', characterId);

  }, [socket]);

  const finishSetup = useCallback(() => {

    socket?.emit('finish-setup');

  }, [socket]);

  const selectCharacter = useCallback((characterId: string) => {

    socket?.emit('select-character', characterId);

  }, [socket]);

  const eliminateCharacter = useCallback((characterId: string) => {

    socket?.emit('eliminate-character', characterId);

  }, [socket]);

  const restoreCharacter = useCallback((characterId: string) => {

    socket?.emit('restore-character', characterId);

  }, [socket]);

  const guessCharacter = useCallback((characterId: string) => {

    socket?.emit('guess-character', characterId);

  }, [socket]);

  const rematch = useCallback(() => {

    socket?.emit('rematch');

  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        room,
        playerId,
        isConnected,
        createRoom,
        joinRoom,
        startSetup,
        addCharacter,
        removeCharacter,
        finishSetup,
        selectCharacter,
        eliminateCharacter,
        restoreCharacter,
        guessCharacter,
        rematch,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};