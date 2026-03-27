// ============================================================
// SyncUs - Authentication Service
// ============================================================

import { auth, db } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKeys } from '../constants';
import { User } from '../types';

/**
 * Sign up a new user with email and password.
 * Creates Firebase Auth account.
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
): Promise<string> => {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  const userId = credential.user.uid;
  await AsyncStorage.setItem(StorageKeys.USER_ID, userId);
  await AsyncStorage.setItem(StorageKeys.USER_EMAIL, email);
  return userId;
};

/**
 * Sign in an existing user with email and password.
 */
export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<string> => {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  const userId = credential.user.uid;
  await AsyncStorage.setItem(StorageKeys.USER_ID, userId);
  await AsyncStorage.setItem(StorageKeys.USER_EMAIL, email);
  return userId;
};

/**
 * Sign out the current user.
 */
export const signOut = async (): Promise<void> => {
  await auth().signOut();
  await AsyncStorage.multiRemove([
    StorageKeys.USER_ID,
    StorageKeys.USER_EMAIL,
    StorageKeys.ONBOARDED,
    StorageKeys.LAST_ROOM,
  ]);
};

/**
 * Get the currently authenticated Firebase user.
 */
export const getCurrentUser = () => {
  return auth().currentUser;
};

/**
 * Create a user profile document in Firestore.
 */
export const createUserProfile = async (
  userId: string,
  email: string,
  displayName: string,
): Promise<void> => {
  await db.users().doc(userId).set({
    email,
    displayName,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
  });
  await AsyncStorage.setItem(StorageKeys.ONBOARDED, 'true');
};

/**
 * Get user profile from Firestore.
 */
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const doc = await db.users().doc(userId).get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  return {
    uid: userId,
    email: data?.email ?? '',
    displayName: data?.displayName ?? '',
    createdAt: data?.createdAt,
    lastLoginAt: data?.lastLoginAt,
  };
};

/**
 * Update user's last login timestamp.
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  await db.users().doc(userId).update({
    lastLoginAt: Date.now(),
  });
};

/**
 * Check if the user has completed onboarding.
 */
export const checkOnboardingStatus = async (): Promise<boolean> => {
  const value = await AsyncStorage.getItem(StorageKeys.ONBOARDED);
  return value === 'true';
};

/**
 * Listen to auth state changes.
 */
export const onAuthStateChanged = (
  callback: (userId: string | null) => void,
) => {
  return auth().onAuthStateChanged((user: any) => {
    callback(user?.uid ?? null);
  });
};
