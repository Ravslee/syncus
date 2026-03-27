// ============================================================
// SyncUs - Auth Hook
// ============================================================

import {useEffect, useState} from 'react';
import {useAppStore} from '../store/useAppStore';
import {
  onAuthStateChanged,
  getUserProfile,
  checkOnboardingStatus,
  updateLastLogin,
} from '../services/authService';

export const useAuth = () => {
  const [loading, setLoading] = useState(true);
  const {user, isOnboarded, setUser, setOnboarded} = useAppStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (userId) => {
      if (userId) {
        try {
          // Fetch user profile from Firestore
          const profile = await getUserProfile(userId);
          if (profile) {
            setUser(profile);
            await updateLastLogin(userId);
          }

          // Check onboarding status
          const onboarded = await checkOnboardingStatus();
          setOnboarded(onboarded);
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUser(null);
        setOnboarded(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setOnboarded]);

  return {user, isOnboarded, loading};
};
