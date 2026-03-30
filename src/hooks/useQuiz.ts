// ============================================================
// SyncUs - Quiz Hook
// ============================================================

import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  submitAnswer,
  updateProgress,
  markCompleted,
  batchSubmitAnswers,
} from '../services/quizService';
import { Answer } from '../types';

export const useQuiz = (roomId: string) => {
  const {
    user,
    questions,
    currentQuestionIndex,
    answers,
    setAnswer,
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

      // Submit answer to Firestore
      await submitAnswer(roomId, user.uid, currentQuestion.id, selectedOption);

      if (isLastQuestion) {
        // Batch submit all answers for reliability
        const allAnswers: Answer[] = Object.entries({
          ...answers,
          [currentQuestion.id]: selectedOption,
        }).map(([questionId, option]) => ({
          roomId,
          userId: user.uid,
          questionId,
          selectedOption: option,
          createdAt: Date.now(),
        }));

        await batchSubmitAnswers(allAnswers);

        // Mark user as completed
        await markCompleted(roomId, user.uid);

        // Progress index to trigger navigation
        nextQuestion();
      } else {
        // Update progress
        const nextIndex = currentQuestionIndex + 1;
        await updateProgress(roomId, user.uid, nextIndex);
        nextQuestion();
      }
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
    ],
  );

  return {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions: questions.length,
    isLastQuestion,
    progress,
    answers,
    handleAnswer,
  };
};
