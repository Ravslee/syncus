// ============================================================
// SyncUs - Partner Status Hook
// ============================================================

import {useEffect} from 'react';
import {useAppStore} from '../store/useAppStore';
import {listenToRoomStates} from '../services/roomService';

export const usePartnerStatus = (roomId: string | undefined) => {
  const {user, partnerStatus, setPartnerStatus} = useAppStore();

  useEffect(() => {
    if (!roomId || !user) {
      return;
    }

    const unsubscribe = listenToRoomStates(roomId, (states) => {
      // Find the partner's state (not the current user)
      const partner = states.find(s => s.userId !== user.uid);
      setPartnerStatus(partner ?? null);
    });

    return () => unsubscribe();
  }, [roomId, user, setPartnerStatus]);

  return {partnerStatus};
};
