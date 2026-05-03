// ============================================================
// SyncUs - Room Presence Hook
// ============================================================

import {useEffect} from 'react';
import {useAppStore} from '../store/useAppStore';
import {listenToRoomStates} from '../services/roomService';

export const useRoomPresence = (roomId: string | undefined) => {
  const {user, setPartnerStatus, setMyStatus} = useAppStore();

  useEffect(() => {
    if (!roomId || !user) {
      return;
    }

    const unsubscribe = listenToRoomStates(roomId, (states) => {
      // Find the partner's state (not the current user)
      const partner = states.find(s => s.userId !== user.uid);
      setPartnerStatus(partner ?? null);

      // Find my own state
      const me = states.find(s => s.userId === user.uid);
      setMyStatus(me ?? null);
    });

    return () => unsubscribe();
  }, [roomId, user, setPartnerStatus, setMyStatus]);

  // We return them from the store via hook consumption if needed
  const {partnerStatus, myStatus} = useAppStore();
  return {partnerStatus, myStatus};
};
