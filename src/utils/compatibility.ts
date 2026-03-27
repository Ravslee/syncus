// ============================================================
// SyncUs - Utility: Compatibility Calculation
// ============================================================

import {QuestionBreakdown, Result, Answer} from '../types';

/**
 * Compare two users' answers and compute compatibility.
 */
export const computeCompatibility = (
  user1Answers: Answer[],
  user2Answers: Answer[],
  questionTexts: Record<string, string>,
): {score: number; breakdown: QuestionBreakdown[]} => {
  const user1Map = new Map(
    user1Answers.map(a => [a.questionId, a.selectedOption]),
  );
  const user2Map = new Map(
    user2Answers.map(a => [a.questionId, a.selectedOption]),
  );

  const allQuestionIds = new Set([
    ...user1Map.keys(),
    ...user2Map.keys(),
  ]);

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
      questionText: questionTexts[qId] ?? '',
      user1Answer: u1,
      user2Answer: u2,
      match,
    });
  });

  const total = allQuestionIds.size;
  const score = total > 0 ? Math.round((matches / total) * 100) : 0;

  return {score, breakdown};
};
