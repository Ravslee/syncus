// ============================================================
// SyncUs - Result Service
// ============================================================

import {db} from './firebase';
import {Result, QuestionBreakdown, RoomStatus} from '../types';
import {fetchUserAnswers} from './quizService';
import {updateRoomStatus} from './roomService';
import {SAMPLE_QUESTIONS} from '../constants';

/**
 * Calculate compatibility results for a room.
 * Compares answers between both users.
 */
export const calculateResults = async (roomId: string): Promise<Result> => {
  // Get room to find both user IDs
  const roomDoc = await db.rooms().doc(roomId).get();
  if (!roomDoc.exists) {
    throw new Error('Room not found');
  }

  const roomData = roomDoc.data();
  const users = roomData?.users as string[];
  if (users.length !== 2) {
    throw new Error('Room does not have 2 users');
  }

  const [user1Id, user2Id] = users;

  // Fetch answers for both users with retry for Firestore eventual consistency
  let [user1Answers, user2Answers] = await Promise.all([
    fetchUserAnswers(roomId, user1Id),
    fetchUserAnswers(roomId, user2Id),
  ]);

  let retries = 0;
  while ((user1Answers.length === 0 || user2Answers.length === 0) && retries < 5) {
    await new Promise<void>(resolve => setTimeout(resolve, 1000));
    const [u1, u2] = await Promise.all([
      fetchUserAnswers(roomId, user1Id),
      fetchUserAnswers(roomId, user2Id),
    ]);
    user1Answers = u1;
    user2Answers = u2;
    retries++;
  }

  // Build answer maps keyed by questionId
  const user1Map = new Map(
    user1Answers.map(a => [a.questionId, a.selectedOption]),
  );
  const user2Map = new Map(
    user2Answers.map(a => [a.questionId, a.selectedOption]),
  );

  // Get all unique question IDs
  const allQuestionIds = new Set([
    ...user1Map.keys(),
    ...user2Map.keys(),
  ]);

  // Build question text map from sample questions for breakdown
  const questionTextMap = new Map(
    SAMPLE_QUESTIONS.map(q => [q.id, q.text]),
  );

  // Calculate breakdown
  const breakdown: QuestionBreakdown[] = [];
  let matches = 0;

  allQuestionIds.forEach(qId => {
    const u1 = user1Map.get(qId) ?? -1;
    const u2 = user2Map.get(qId) ?? -1;
    const match = u1 === u2 && u1 !== -1;

    if (match) {
      matches++;
    }

    breakdown.push({
      questionId: qId,
      questionText: questionTextMap.get(qId) ?? '',
      user1Answer: u1,
      user2Answer: u2,
      match,
    });
  });

  const totalQuestions = allQuestionIds.size;
  const score = totalQuestions > 0
    ? Math.round((matches / totalQuestions) * 100)
    : 0;

  const result: Result = {
    roomId,
    score,
    totalQuestions,
    breakdown,
    calculatedAt: Date.now(),
    users,
    categoryId: roomData?.categoryId ?? '',
    createdAt: Date.now(),
  };

  return result;
};

/**
 * Save results to Firestore.
 */
export const saveResults = async (
  roomId: string,
  result: Result,
): Promise<void> => {
  // Use unique ID to avoid overwriting previous rounds
  const resultId = `${roomId}__${Date.now()}`;
  await db.results().doc(resultId).set(result);
};

/**
 * Fetch results for a room (most recent).
 */
export const fetchResults = async (roomId: string): Promise<Result | null> => {
  const snapshot = await db
    .results()
    .where('roomId', '==', roomId)
    .orderBy('calculatedAt', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }
  return snapshot.docs[0].data() as Result;
};

/**
 * Fetch quiz history for a user.
 * Returns all results where the user participated, ordered by most recent.
 */
export const fetchHistory = async (userId: string): Promise<Result[]> => {
  const snapshot = await db
    .results()
    .where('users', 'array-contains', userId)
    .orderBy('calculatedAt', 'desc')
    .limit(20)
    .get();

  return snapshot.docs.map((doc: any) => doc.data() as Result);
};
