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
          let onboarded = false;
          if (profile) {
            setUser(profile);
            await updateLastLogin(userId);
            onboarded = true;
            // Restore local storage flag since they already have a profile
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const { StorageKeys } = require('../constants');
            await AsyncStorage.setItem(StorageKeys.ONBOARDED, 'true');
          } else {
            // Check onboarding status manually if no profile was immediately found
            onboarded = await checkOnboardingStatus();
          }
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
