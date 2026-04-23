// ============================================================
// SyncUs - Quiz Hook
// ============================================================

import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  submitAnswer,
  submitGuess,
  updateProgress,
  markCompleted,
  batchSubmitAnswers,
} from '../services/quizService';
import { Answer, UserRoomStatus } from '../types';

export const useQuiz = (roomId: string, categoryId: string) => {
  const {
    user,
    room,
    questions,
    quizPhase,
    currentQuestionIndex,
    answers,
    guesses,
    setAnswer,
    setGuess,
    nextQuestion,
  } = useAppStore();

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;
  const progress = questions.length > 0
    ? (currentQuestionIndex + 1) / questions.length
    : 0;

  /**
   * Handle answering a question.
   * Submits to Firestore, updates local state, and progresses to next question.
   */
  const handleAnswer = useCallback(
    async (selectedOption: number) => {
      if (!user || !currentQuestion) {
        return;
      }

      // Save answer locally
      setAnswer(currentQuestion.id, selectedOption);

      // Transition to next question immediately (optimistic UI)
      nextQuestion();

      // Submit to Firestore in the background
      const roundId = room?.currentRoundId || 'legacy_round';
      
      const syncBackground = async () => {
        try {
          await submitAnswer(roomId, user.uid, currentQuestion.id, selectedOption, roundId, categoryId);

          if (isLastQuestion) {
            // Batch submit all answers for reliability
            const allAnswers: Answer[] = Object.entries({
              ...answers,
              [currentQuestion.id]: selectedOption,
            }).map(([questionId, option]) => ({
              roomId,
              roundId,
              userId: user.uid,
              questionId,
              categoryId,
              selectedOption: option,
              createdAt: Date.now(),
            }));

            await batchSubmitAnswers(allAnswers);

            // Mark user as waiting for partner to finish Phase 1
            await updateProgress(roomId, user.uid, questions.length, UserRoomStatus.WAITING_FOR_PARTNER);
          } else {
            // Update progress
            const nextIndex = currentQuestionIndex + 1;
            await updateProgress(roomId, user.uid, nextIndex, UserRoomStatus.ANSWERING);
          }
        } catch (err) {
          console.error('Background sync failed for answer', err);
        }
      };

      syncBackground();
    },
    [
      user,
      currentQuestion,
      currentQuestionIndex,
      isLastQuestion,
      roomId,
      answers,
      setAnswer,
      nextQuestion,
      room?.currentRoundId,
    ],
  );

  const handleGuess = useCallback(
    async (guessedOption: number) => {
      if (!user || !currentQuestion) return;
      
      // Save locally immediately
      setGuess(currentQuestion.id, guessedOption);
      
      const roundId = room?.currentRoundId || 'legacy_round';
      
      const syncBackground = async () => {
        try {
          await submitGuess(roomId, user.uid, currentQuestion.id, guessedOption, roundId, categoryId);

          if (isLastQuestion) {
            await markCompleted(roomId, user.uid);
          } else {
            const nextIndex = currentQuestionIndex + 1;
            await updateProgress(roomId, user.uid, nextIndex, UserRoomStatus.GUESSING);
          }
        } catch (err) {
          console.error('Background sync failed for guess', err);
        }
      };

      syncBackground();
    },
    [
      user,
      currentQuestion,
      currentQuestionIndex,
      isLastQuestion,
      roomId,
      guesses,
      setGuess,
      room?.currentRoundId,
    ],
  );

  const handleNext = useCallback(async () => {
     nextQuestion();
  }, [nextQuestion]);

  return {
    quizPhase,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: questions.length,
    isLastQuestion,
    progress,
    answers,
    guesses,
    handleAnswer,
    handleGuess,
    handleNext,
  };
};
