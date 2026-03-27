// ============================================================
// SyncUs - Result Screen (Reveal Together Gate)
// ============================================================

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {ScreenWrapper} from '../components/ScreenWrapper';
import {CircularProgress} from '../components/CircularProgress';
import {GradientButton} from '../components/GradientButton';
import {GlassCard} from '../components/GlassCard';
import {Colors, Typography, Spacing, Shadows} from '../constants/theme';
import {RootStackParamList, UserRoomStatus} from '../types';
import {usePartnerStatus} from '../hooks/usePartnerStatus';
import {useResults} from '../hooks/useResults';
import {useAppStore} from '../store/useAppStore';
import {getCompatibilityLabel, getInsightText} from '../utils/formatters';
import {CATEGORIES, SAMPLE_QUESTIONS} from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

export const ResultScreen: React.FC<Props> = ({navigation, route}) => {
  const {roomId} = route.params;
  const {partnerStatus} = usePartnerStatus(roomId);
  const {results, loading, error, generateResults} = useResults(roomId);
  const {room} = useAppStore();
  const [revealed, setRevealed] = useState(false);

  const partnerCompleted =
    partnerStatus?.status === UserRoomStatus.COMPLETED;

  // Auto-calculate results when partner completes
  useEffect(() => {
    if (partnerCompleted && !results && !loading) {
      generateResults();
    }
  }, [partnerCompleted, results, loading, generateResults]);

  const category = CATEGORIES.find(c => c.id === room?.categoryId);

  // Waiting for partner
  if (!partnerCompleted) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.waitingEmoji}>⏳</Text>
          <Text style={styles.waitingTitle}>Your partner is answering...</Text>
          <Text style={styles.waitingSubtitle}>
            Sit tight! We'll reveal your results together once both of you
            finish.
          </Text>

          <GlassCard style={styles.partnerCard}>
            <View style={styles.partnerRow}>
              <ActivityIndicator size="small" color={Colors.primaryLight} />
              <Text style={styles.partnerText}>
                Partner is on question{' '}
                {(partnerStatus?.currentQuestionIndex ?? 0) + 1}
              </Text>
            </View>
          </GlassCard>
        </View>
      </ScreenWrapper>
    );
  }

  // Loading results
  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Calculating your sync...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // Error
  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <GradientButton title="Retry" onPress={generateResults} />
        </View>
      </ScreenWrapper>
    );
  }

  // Reveal Together gate
  if (!revealed) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.revealEmoji}>🎉</Text>
          <Text style={styles.revealTitle}>Both done!</Text>
          <Text style={styles.revealSubtitle}>
            Ready to see how well you sync?
          </Text>
          <GradientButton
            title="Reveal Results 💜"
            onPress={() => setRevealed(true)}
            size="lg"
            style={styles.revealButton}
          />
        </View>
      </ScreenWrapper>
    );
  }

  // Show Results
  const score = results?.score ?? 0;

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.resultBadge}>
          {category?.icon} {category?.name}
        </Text>

        <Text style={styles.resultTitle}>
          {score}% <Text style={styles.resultSync}>Sync</Text>
        </Text>

        <CircularProgress
          percentage={score}
          size={200}
          strokeWidth={14}
          color={Colors.primary}
          label="Compatibility"
        />

        <Text style={styles.compatLabel}>
          {getCompatibilityLabel(score)}
        </Text>

        <GlassCard style={styles.insightCard} variant="elevated">
          <Text style={styles.insightTitle}>Personalized Insights</Text>
          <Text style={styles.insightText}>{getInsightText(score)}</Text>
        </GlassCard>

        {/* Breakdown Preview */}
        <GlassCard style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Quick Breakdown</Text>
          <View style={styles.breakdownStats}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>
                {results?.breakdown.filter(b => b.match).length ?? 0}
              </Text>
              <Text style={styles.breakdownLabel}>Matches</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>
                {results?.breakdown.filter(b => !b.match).length ?? 0}
              </Text>
              <Text style={styles.breakdownLabel}>Differences</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>
                {results?.totalQuestions ?? 0}
              </Text>
              <Text style={styles.breakdownLabel}>Questions</Text>
            </View>
          </View>
        </GlassCard>

        <GradientButton
          title="View Full Summary"
          onPress={() => navigation.replace('Summary', {roomId})}
          size="lg"
          style={styles.summaryButton}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  // Waiting state
  waitingEmoji: {fontSize: 56, marginBottom: Spacing.xl},
  waitingTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  waitingSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  partnerCard: {paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl},
  partnerRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
  partnerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  // Loading
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
  },
  // Error
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.error,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  // Reveal gate
  revealEmoji: {fontSize: 72, marginBottom: Spacing.xl},
  revealTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  revealSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
  },
  revealButton: {width: '80%'},
  // Results
  resultBadge: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textAccent,
    fontWeight: '600',
    marginBottom: Spacing.base,
  },
  resultTitle: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.xl,
  },
  resultSync: {
    color: Colors.primary,
  },
  compatLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.primaryLight,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  insightCard: {
    marginBottom: Spacing.xl,
    width: '100%',
  },
  insightTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  insightText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  breakdownCard: {
    marginBottom: Spacing.xl,
    width: '100%',
  },
  breakdownTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: Spacing.base,
  },
  breakdownStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
  },
  breakdownLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  breakdownDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.divider,
  },
  summaryButton: {
    width: '100%',
  },
});
