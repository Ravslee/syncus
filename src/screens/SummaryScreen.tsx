// ============================================================
// SyncUs - Summary Screen
// ============================================================

import React from 'react';
import {View, Text, StyleSheet, Share} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {ScreenWrapper} from '../components/ScreenWrapper';
import {CircularProgress} from '../components/CircularProgress';
import {GradientButton} from '../components/GradientButton';
import {GlassCard} from '../components/GlassCard';
import {Colors, Typography, Spacing, BorderRadius} from '../constants/theme';
import {RootStackParamList} from '../types';
import {useAppStore} from '../store/useAppStore';
import {getCompatibilityLabel, getInsightText} from '../utils/formatters';
import {CATEGORIES, SAMPLE_QUESTIONS} from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Summary'>;
  route: RouteProp<RootStackParamList, 'Summary'>;
};

export const SummaryScreen: React.FC<Props> = ({navigation, route}) => {
  const {results, resetQuiz} = useAppStore();

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
  const score = results.score;
  const matchCount = results.breakdown.filter(b => b.match).length;
  const mismatchCount = results.breakdown.filter(b => !b.match).length;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `We scored ${score}% on SyncUs! ${getCompatibilityLabel(score)} 💜 Try it: syncus.app`,
      });
    } catch {
      // User cancelled
    }
  };

  const handlePlayAgain = () => {
    navigation.replace('CategorySelection', { roomId: route.params.roomId });
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Header Score */}
        <View style={styles.scoreSection}>
          <CircularProgress
            percentage={score}
            size={160}
            strokeWidth={12}
            color={Colors.primary}
            label="Sync"
          />
          <Text style={styles.compatLabel}>
            {getCompatibilityLabel(score)}
          </Text>
        </View>

        {/* Insight */}
        <GlassCard style={styles.insightCard} variant="elevated">
          <Text style={styles.sectionTitle}>💡 Personalized Insights</Text>
          <Text style={styles.insightText}>{getInsightText(score)}</Text>
        </GlassCard>

        {/* Per-Question Breakdown */}
        <Text style={styles.sectionTitle}>📋 Question Breakdown</Text>
        {results.breakdown.map((item, index) => {
          const question = SAMPLE_QUESTIONS.find(
            q => q.id === item.questionId,
          );
          return (
            <GlassCard
              key={item.questionId}
              style={styles.questionRow}
              variant={item.match ? 'default' : 'subtle'}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Q{index + 1}</Text>
                <View
                  style={[
                    styles.matchBadge,
                    {
                      backgroundColor: item.match
                        ? Colors.success + '20'
                        : Colors.error + '20',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.matchText,
                      {color: item.match ? Colors.success : Colors.error},
                    ]}>
                    {item.match ? 'Match ✓' : 'Different ✗'}
                  </Text>
                </View>
              </View>
              <Text style={styles.questionText} numberOfLines={2}>
                {question?.text ?? item.questionText}
              </Text>
              <View style={styles.answersRow}>
                <View style={styles.answerCol}>
                  <Text style={styles.answerLabel}>You</Text>
                  <Text style={styles.answerValue}>
                    {question?.options[item.user1Answer] ?? `Option ${item.user1Answer + 1}`}
                  </Text>
                </View>
                <View style={styles.answerCol}>
                  <Text style={styles.answerLabel}>Partner</Text>
                  <Text style={styles.answerValue}>
                    {question?.options[item.user2Answer] ?? `Option ${item.user2Answer + 1}`}
                  </Text>
                </View>
              </View>
            </GlassCard>
          );
        })}

        {/* Category Breakdown */}
        <GlassCard style={styles.categoryBreakdown} variant="elevated">
          <Text style={styles.sectionTitle}>📊 Category Breakdown</Text>
          <View style={styles.catRow}>
            <Text style={styles.catName}>
              {category?.icon} {category?.name}
            </Text>
            <Text style={styles.catScore}>{score}%</Text>
          </View>
          <View style={styles.catBar}>
            <View
              style={[styles.catBarFill, {width: `${score}%`}]}
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
    fontWeight: '700',
    color: Colors.primaryLight,
    marginTop: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  insightCard: {
    marginBottom: Spacing.xl,
  },
  insightText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  questionRow: {
    marginBottom: Spacing.md,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  questionNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  matchText: {
    fontSize: 11,
    fontWeight: '700',
  },
  questionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: '500',
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
  },
  answerValue: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
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
    color: Colors.white,
    fontWeight: '600',
  },
  catScore: {
    fontSize: Typography.fontSize.base,
    color: Colors.primaryLight,
    fontWeight: '700',
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
  },
});
