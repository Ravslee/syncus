// ============================================================
// SyncUs - Quiz Service
// ============================================================

import { db, firestore } from './firebase';
import {Question, Answer, UserRoomStatus} from '../types';
import {SAMPLE_QUESTIONS, QUESTIONS_PER_QUIZ} from '../constants';

/**
 * Fetch questions for a given category.
 * First tries Firestore, falls back to local sample questions.
 */
export const fetchQuestions = async (
  categoryId: string,
): Promise<Question[]> => {
  try {
    const snapshot = await db
      .questions()
      .where('categoryId', '==', categoryId)
      .orderBy('order', 'asc')
      .limit(QUESTIONS_PER_QUIZ)
      .get();

    if (!snapshot.empty) {
      return snapshot.docs.map(doc => ({
        ...(doc.data() as Question),
        id: doc.id,
      }));
    }
  } catch (error) {
    console.log('Fetching from Firestore failed, using local questions:', error);
  }

  // Fallback to local sample questions
  const localQuestions = SAMPLE_QUESTIONS.filter(
    q => q.categoryId === categoryId,
  ).slice(0, QUESTIONS_PER_QUIZ);

  return localQuestions;
};

/**
 * Submit a single answer.
 */
export const submitAnswer = async (
  roomId: string,
  userId: string,
  questionId: string,
  selectedOption: number,
): Promise<void> => {
  const answerId = `${roomId}__${userId}__${questionId}`;
  const answer: Answer = {
    roomId,
    userId,
    questionId,
    selectedOption,
    createdAt: Date.now(),
  };
  await db.answers().doc(answerId).set(answer);
};

/**
 * Batch submit multiple answers for performance.
 */
export const batchSubmitAnswers = async (
  answers: Answer[],
): Promise<void> => {
  const batch = firestore().batch();

  answers.forEach(answer => {
    const answerId = `${answer.roomId}__${answer.userId}__${answer.questionId}`;
    const ref = db.answers().doc(answerId);
    batch.set(ref, answer);
  });

  await batch.commit();
};

/**
 * Update the user's quiz progress in their room state.
 */
export const updateProgress = async (
  roomId: string,
  userId: string,
  questionIndex: number,
): Promise<void> => {
  const stateId = `${roomId}__${userId}`;
  await db.roomStates().doc(stateId).update({
    currentQuestionIndex: questionIndex,
    status: UserRoomStatus.ANSWERING,
  });
};

/**
 * Mark the user as completed in their room state.
 */
export const markCompleted = async (
  roomId: string,
  userId: string,
): Promise<void> => {
  const stateId = `${roomId}__${userId}`;
  await db.roomStates().doc(stateId).update({
    status: UserRoomStatus.COMPLETED,
    completedAt: Date.now(),
  });
};

/**
 * Fetch all answers for a specific user in a room.
 */
export const fetchUserAnswers = async (
  roomId: string,
  userId: string,
): Promise<Answer[]> => {
  const snapshot = await db
    .answers()
    .where('roomId', '==', roomId)
    .where('userId', '==', userId)
    .get();

  return snapshot.docs.map(doc => doc.data() as Answer);
};
/**
 * Clear all answers in a room for a specific user.
 * Used when starting a new round of quiz.
 */
export const clearRoomAnswers = async (
  roomId: string,
  userId: string,
): Promise<void> => {
  const snapshot = await db
    .answers()
    .where('roomId', '==', roomId)
    .where('userId', '==', userId)
    .get();

  const batch = firestore().batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};
