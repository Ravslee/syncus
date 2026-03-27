// ============================================================
// SyncUs - Firebase Configuration
// ============================================================

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export {firestore, auth};

// Helper to get typed collection references
export const db = {
  users: () => firestore().collection('users'),
  rooms: () => firestore().collection('rooms'),
  roomStates: () => firestore().collection('roomStates'),
  questions: () => firestore().collection('questions'),
  answers: () => firestore().collection('answers'),
  results: () => firestore().collection('results'),
};
