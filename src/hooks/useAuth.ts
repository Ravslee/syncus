// ============================================================
// SyncUs - Auth Hook
// ============================================================

import {useEffect, useState} from 'react';
import {useAppStore} from '../store/useAppStore';
import {
  onAuthStateChanged,
  getUserProfile,
  updateLastLogin,
  getCurrentUser,
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
            setOnboarded(true);
            await updateLastLogin(userId);
            // Restore local storage flag since they already have a profile
            const AsyncStorage = require('@react-native-async-storage/async-storage').default;
            const { StorageKeys } = require('../constants');
            await AsyncStorage.setItem(StorageKeys.ONBOARDED, 'true');
          } else {
            // User is authenticated but has no Firestore profile yet (needs onboarding).
            // Set a minimal user so the navigator leaves the auth flow.
            const firebaseUser = getCurrentUser();
            setUser({
              uid: userId,
              email: firebaseUser?.email ?? '',
              displayName: '',
            });
            setOnboarded(false);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          // Even on error, set a minimal user so we don't stay stuck on Login.
          const firebaseUser = getCurrentUser();
          setUser({
            uid: userId,
            email: firebaseUser?.email ?? '',
            displayName: '',
          });
          setOnboarded(false);
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
