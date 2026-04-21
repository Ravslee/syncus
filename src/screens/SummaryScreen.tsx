// ============================================================
// SyncUs - Summary Screen
// ============================================================

import React from 'react';
import { View, Text, StyleSheet, Share } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { CircularProgress } from '../components/CircularProgress';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { getCompatibilityLabel, getInsightText } from '../utils/formatters';
import { CATEGORIES, SAMPLE_QUESTIONS } from '../constants';
import { db } from '../services/firebase';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Summary'>;
  route: RouteProp<RootStackParamList, 'Summary'>;
};

export const SummaryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { results, resetQuiz, user, partner } = useAppStore();
  const partnerName = partner?.displayName ?? 'Partner';

  if (!results) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <Text style={styles.errorText}>No results found</Text>
          <GradientButton
            title="Go Home"
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </ScreenWrapper>
    );
  }

  const category = CATEGORIES.find(c => c.id === results.categoryId);
  const isUser1 = results.users[0] === user?.uid;
  const myScore = isUser1 ? results.user1Score : results.user2Score;
  const total = results.totalQuestions || 1;
  const scorePerc = Math.round((myScore / total) * 100);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I guessed ${myScore} of your answers right on SyncUs! 💜 Try it: syncus.app`,
      });
    } catch {
      // User cancelled
    }
  };

  const handlePlayAgain = () => {
    navigation.navigate('Home');
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Header Score */}
        <View style={styles.scoreSection}>
          <CircularProgress
            percentage={scorePerc}
            size={160}
            strokeWidth={12}
            color={Colors.primary}
            label="Accuracy"
          />
          <Text style={styles.compatLabel}>
            You got {myScore} out of {total}!
          </Text>
        </View>

        {/* Insight */}
        <GlassCard style={styles.insightCard} variant="elevated">
          <Text style={styles.sectionTitle}>Detailed Breakdown</Text>
          <Text style={styles.insightText}>See below for exactly what you guessed vs what {partnerName} actually chose.</Text>
        </GlassCard>

        {/* Per-Question Breakdown */}
        <Text style={styles.sectionTitle}>Question Breakdown</Text>
        {results.breakdown.map((item, index) => {
          const question = SAMPLE_QUESTIONS.find(
            q => q.id === item.questionId,
          );
          
          const myGuess = isUser1 ? item.user1Guess : item.user2Guess;
          const partnerAnswer = isUser1 ? item.user2Answer : item.user1Answer;
          const match = isUser1 ? item.user1Match : item.user2Match;

          return (
            <GlassCard
              key={item.questionId}
              style={styles.questionRow}
              variant={match ? 'default' : 'subtle'}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Q{index + 1}</Text>
                <View
                  style={[
                    styles.matchBadge,
                    {
                      backgroundColor: match
                        ? Colors.success + '20'
                        : Colors.error + '20',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.matchText,
                      { color: match ? Colors.success : Colors.error },
                    ]}>
                    {match ? 'Hit! ✓' : 'Miss ✗'}
                  </Text>
                </View>
              </View>
              <Text style={styles.questionText} numberOfLines={2}>
                {question?.text ?? item.questionText}
              </Text>
              <View style={styles.answersRow}>
                <View style={styles.answerCol}>
                  <Text style={styles.answerLabel}>You Guessed</Text>
                  <Text style={styles.answerValue}>
                    {question?.options[myGuess] ?? `Option ${myGuess + 1}`}
                  </Text>
                </View>
                <View style={styles.answerCol}>
                  <Text style={styles.answerLabel}>{partnerName} Chose</Text>
                  <Text style={styles.answerValue}>
                    {question?.options[partnerAnswer] ?? `Option ${partnerAnswer + 1}`}
                  </Text>
                </View>
              </View>
            </GlassCard>
          );
        })}

        {/* Category Breakdown */}
        <GlassCard style={styles.categoryBreakdown} variant="elevated">
          <Text style={styles.sectionTitle}>📊 Category Accuracy</Text>
          <View style={styles.catRow}>
            <Text style={styles.catName}>
              {category?.icon} {category?.name}
            </Text>
            <Text style={styles.catScore}>{scorePerc}%</Text>
          </View>
          <View style={styles.catBar}>
            <View
              style={[styles.catBarFill, { width: `${scorePerc}%` }]}
            />
          </View>
        </GlassCard>

        {/* Actions */}
        <View style={styles.actions}>
          <GradientButton
            title="Share Results 📤"
            onPress={handleShare}
            size="lg"
            style={styles.actionButton}
          />
          <GradientButton
            title="Play Again"
            onPress={handlePlayAgain}
            variant="secondary"
            size="lg"
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreSection: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  compatLabel: {
    fontSize: Typography.fontSize.lg,
    color: Colors.primaryLight,
    marginTop: Spacing.base,
    fontFamily: Typography.fontFamily.bold,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily.bold,
  },
  insightCard: {
    marginBottom: Spacing.xl,
  },
  insightText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontFamily: Typography.fontFamily.regular,
  },
  questionRow: {
    marginBottom: Spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  questionNumber: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.bold,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  matchText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
  },
  questionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semibold,
    marginBottom: Spacing.md,
  },
  answersRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  answerCol: {
    flex: 1,
  },
  answerLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    marginBottom: 2,
    fontFamily: Typography.fontFamily.semibold,
  },
  answerValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.semibold,
  },
  categoryBreakdown: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  catName: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.semibold,
  },
  catScore: {
    fontSize: Typography.fontSize.base,
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily.bold,
  },
  catBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  actions: {
    gap: Spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.error,
    marginBottom: Spacing.xl,
    fontFamily: Typography.fontFamily.regular,
  },
});
