// ============================================================
// SyncUs - Utility: Room Code Generation
// ============================================================

import {ROOM_CODE_LENGTH, ROOM_CODE_CHARS} from '../constants';

/**
 * Generate a random room code (not collision-checked).
 * Use roomService.generateRoomCode() for Firestore-unique codes.
 */
export const generateCode = (): string => {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS.charAt(
      Math.floor(Math.random() * ROOM_CODE_CHARS.length),
    );
  }
  return code;
};

/**
 * Validate a room code format.
 */
export const isValidRoomCode = (code: string): boolean => {
  const pattern = new RegExp(`^[A-Z0-9]{${ROOM_CODE_LENGTH}}$`);
  return pattern.test(code.toUpperCase());
};
