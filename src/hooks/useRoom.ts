// ============================================================
// SyncUs - Room Hook
// ============================================================

import {useEffect, useCallback} from 'react';
import {useAppStore} from '../store/useAppStore';
import {listenToRoom} from '../services/roomService';

export const useRoom = (roomId: string | undefined) => {
  const {room, setRoom} = useAppStore();

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const unsubscribe = listenToRoom(roomId, (updatedRoom) => {
      setRoom(updatedRoom);
    });

    return () => unsubscribe();
  }, [roomId, setRoom]);

  const clearRoom = useCallback(() => {
    setRoom(null);
  }, [setRoom]);

  return {room, clearRoom};
};
