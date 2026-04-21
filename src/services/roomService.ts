// ============================================================
// SyncUs - Room Service
// ============================================================

import {db} from './firebase';
import {Room, RoomState, RoomStatus, UserRoomStatus} from '../types';
import {
  ROOM_CODE_LENGTH,
  ROOM_CODE_CHARS,
  ROOM_CODE_MAX_RETRIES,
  MAX_ROOM_USERS,
  Collections,
} from '../constants';

/**
 * Generate a random room code (5-char uppercase alphanumeric).
 */
const generateCode = (): string => {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS.charAt(
      Math.floor(Math.random() * ROOM_CODE_CHARS.length),
    );
  }
  return code;
};

/**
 * Generate a unique room code by checking against Firestore.
 * Retries on collision up to MAX_RETRIES.
 */
export const generateRoomCode = async (): Promise<string> => {
  for (let attempt = 0; attempt < ROOM_CODE_MAX_RETRIES; attempt++) {
    const code = generateCode();
    const existing = await db
      .rooms()
      .where('code', '==', code)
      .where('status', 'in', [RoomStatus.WAITING, RoomStatus.ACTIVE])
      .limit(1)
      .get();

    if (existing.empty) {
      return code;
    }
  }
  throw new Error('Failed to generate a unique room code. Please try again.');
};

/**
 * Create a new quiz room.
 */
export const createRoom = async (userId: string): Promise<Room> => {
  const code = await generateRoomCode();
  const roomRef = db.rooms().doc();
  const room: Room = {
    id: roomRef.id,
    code,
    users: [userId],
    status: RoomStatus.WAITING,
    categoryId: '',
    createdAt: Date.now(),
  };

  await roomRef.set(room);

  // Create initial room state for the creator
  const stateId = `${roomRef.id}__${userId}`;
  const roomState: RoomState = {
    roomId: roomRef.id,
    userId,
    status: UserRoomStatus.JOINED,
    currentQuestionIndex: 0,
    completedAt: null,
  };
  await db.roomStates().doc(stateId).set(roomState);

  return room;
};

/**
 * Join an existing room by its code.
 * Validates the room exists, is waiting, and isn't full.
 */
export const joinRoom = async (
  code: string,
  userId: string,
): Promise<Room> => {
  const upperCode = code.toUpperCase().trim();
  const snapshot = await db
    .rooms()
    .where('code', '==', upperCode)
    .where('status', '==', RoomStatus.WAITING)
    .limit(1)
    .get();

  if (snapshot.empty) {
    throw new Error('Room not found. Check the code and try again.');
  }

  const roomDoc = snapshot.docs[0];
  const roomData = roomDoc.data() as Room;

  // Check if user is already in the room
  if (roomData.users.includes(userId)) {
    return {...roomData, id: roomDoc.id};
  }

  // Check if room is full
  if (roomData.users.length >= MAX_ROOM_USERS) {
    throw new Error('This room is full.');
  }

  // Add user to room and set status to active
  await roomDoc.ref.update({
    users: [...roomData.users, userId],
    status: RoomStatus.ACTIVE,
  });

  // Create room state for the joiner
  const stateId = `${roomDoc.id}__${userId}`;
  const roomState: RoomState = {
    roomId: roomDoc.id,
    userId,
    status: UserRoomStatus.JOINED,
    currentQuestionIndex: 0,
    completedAt: null,
  };
  await db.roomStates().doc(stateId).set(roomState);

  return {
    ...roomData,
    id: roomDoc.id,
    users: [...roomData.users, userId],
    status: RoomStatus.ACTIVE,
  };
};

/**
 * Listen to real-time changes on a room document.
 */
export const listenToRoom = (
  roomId: string,
  callback: (room: Room | null) => void,
) => {
  return db
    .rooms()
    .doc(roomId)
    .onSnapshot(
      snapshot => {
        if (typeof snapshot.exists === 'function' ? snapshot.exists() : snapshot.exists) {
          callback({...(snapshot.data() as Room), id: snapshot.id});
        } else {
          callback(null);
        }
      },
      error => {
        console.error('Error listening to room:', error);
        callback(null);
      },
    );
};

/**
 * Listen to room states for all users in a room.
 */
export const listenToRoomStates = (
  roomId: string,
  callback: (states: RoomState[]) => void,
) => {
  return db
    .roomStates()
    .where('roomId', '==', roomId)
    .onSnapshot(
      snapshot => {
        const states = snapshot.docs.map(doc => doc.data() as RoomState);
        callback(states);
      },
      error => {
        console.error('Error listening to room states:', error);
        callback([]);
      },
    );
};

/**
 * Update the status of a room.
 */
export const updateRoomStatus = async (
  roomId: string,
  status: RoomStatus,
): Promise<void> => {
  await db.rooms().doc(roomId).update({status});
};

/**
 * Update room category.
 */
export const updateRoomCategory = async (
  roomId: string,
  categoryId: string,
): Promise<void> => {
  await db.rooms().doc(roomId).update({categoryId});
};

/**
 * Get a room by its ID.
 */
export const getRoomById = async (roomId: string): Promise<Room | null> => {
  const doc = await db.rooms().doc(roomId).get();
  if (!(typeof doc.exists === 'function' ? doc.exists() : doc.exists)) {
    return null;
  }
  return {...(doc.data() as Room), id: doc.id};
};

/**
 * Get an active or waiting room for a user.
 */
export const getActiveRoomForUser = async (userId: string): Promise<Room | null> => {
  const snapshot = await db.rooms()
    .where('users', 'array-contains', userId)
    .where('status', 'in', [RoomStatus.WAITING, RoomStatus.ACTIVE])
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }
  return { ...(snapshot.docs[0].data() as Room), id: snapshot.docs[0].id };
};

/**
 * Leave a room and clean up server state.
 */
export const leaveRoom = async (roomId: string, userId: string): Promise<void> => {
  const roomRef = db.rooms().doc(roomId);
  const roomDoc = await roomRef.get();

  if (typeof roomDoc.exists === 'function' ? roomDoc.exists() : roomDoc.exists) {
    const roomData = roomDoc.data() as Room;
    const updatedUsers = roomData.users.filter(id => id !== userId);

    if (updatedUsers.length === 0) {
      // Last user left, close the room
      await roomRef.update({
        users: [],
        status: RoomStatus.COMPLETED,
      });
    } else {
      // Room still has users, just remove this one and go back to WAITING
      await roomRef.update({
        users: updatedUsers,
        status: RoomStatus.WAITING,
      });
    }
  }

  // Delete the user's room state
  const stateId = `${roomId}__${userId}`;
  await db.roomStates().doc(stateId).delete();
};
