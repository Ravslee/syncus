// ============================================================
// SyncUs - Room Presence Hook
// ============================================================

import {useEffect} from 'react';
import {useAppStore} from '../store/useAppStore';
import {listenToRoomStates} from '../services/roomService';
import {db} from '../services/firebase';
import {User} from '../types';

export const useRoomPresence = (roomId: string | undefined) => {
  const {user, room, partner, setPartner, setPartnerStatus, setMyStatus} = useAppStore();

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

  // Fetch partner profile if missing
  useEffect(() => {
    const fetchPartner = async () => {
      if (!roomId || !user || partner || !room) return;

      const partnerId = room.users.find(id => id !== user.uid);
      if (partnerId) {
        try {
          const pDoc = await db.users().doc(partnerId).get();
          if (typeof pDoc.exists === 'function' ? pDoc.exists() : pDoc.exists) {
            setPartner({uid: partnerId, ...pDoc.data()} as User);
          }
        } catch (e) {
          console.error('Failed to fetch partner profile:', e);
        }
      }
    };
    fetchPartner();
  }, [roomId, user, partner, room, setPartner]);

  // We return them from the store via hook consumption if needed
  const {partnerStatus, myStatus} = useAppStore();
  return {partnerStatus, myStatus};
};
