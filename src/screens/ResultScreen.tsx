// ============================================================
// SyncUs - Result Screen (Reveal Together Gate)
// ============================================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { CircularProgress } from '../components/CircularProgress';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { RootStackParamList, UserRoomStatus } from '../types';
import { usePartnerStatus } from '../hooks/usePartnerStatus';
import { useResults } from '../hooks/useResults';
import { useAppStore } from '../store/useAppStore';
import { getCompatibilityLabel, getInsightText } from '../utils/formatters';
import { CATEGORIES, SAMPLE_QUESTIONS } from '../constants';
import { db } from '../services/firebase';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Result'>;
  route: RouteProp<RootStackParamList, 'Result'>;
};

export const ResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { roomId } = route.params;
  const { partnerStatus } = usePartnerStatus(roomId);
  const { results, loading, error, generateResults } = useResults(roomId);
  const { user, room } = useAppStore();
  const [revealed, setRevealed] = useState(false);
  const [partnerName, setPartnerName] = useState<string>('partner');

  // Fetch partner name
  useEffect(() => {
    const fetchPartner = async () => {
      if (!room || !user) return;
      const partnerId = room.users.find(id => id !== user.uid);
      if (partnerId) {
        try {
          const pDoc = await db.users().doc(partnerId).get();
          if (typeof pDoc.exists === 'function' ? pDoc.exists() : pDoc.exists) {
            setPartnerName(pDoc.data()?.displayName ?? 'partner');
          }
        } catch (e) {
          console.error('Failed to fetch partner:', e);
        }
      }
    };
    fetchPartner();
  }, [room, user]);

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
  const isUser1 = results?.users[0] === user?.uid;
  const myScore = isUser1 ? results?.user1Score ?? 0 : results?.user2Score ?? 0;
  const partnerScore = isUser1 ? results?.user2Score ?? 0 : results?.user1Score ?? 0;
  const total = results?.totalQuestions || 1;

  const myPerc = Math.round((myScore / total) * 100);

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.resultBadge}>
          {category?.icon} {category?.name}
        </Text>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreBox}>
            <Text style={styles.playerName}>{user?.displayName?.split(' ')[0] || 'You'}</Text>
            <Text style={styles.resultTitle}>{myScore}/{total}</Text>
          </View>
          
          <Text style={styles.resultSync}>vs</Text>
          
          <View style={styles.scoreBox}>
            <Text style={styles.playerName}>{partnerName.split(' ')[0]}</Text>
            <Text style={styles.resultTitle}>{partnerScore}/{total}</Text>
          </View>
        </View>

        <CircularProgress
          percentage={myPerc}
          size={200}
          strokeWidth={14}
          color={Colors.primary}
          label="Your Accuracy"
        />

        <Text style={styles.compatLabel}>
          {myScore > partnerScore ? 'You know them better! 🎉' : partnerScore > myScore ? 'They know you better! 😅' : 'Its a tie! 🤝'}
        </Text>

        <GlassCard style={styles.insightCard} variant="elevated">
          <Text style={styles.insightTitle}>How did you do?</Text>
          <Text style={styles.insightText}>
             You correctly guessed {myScore} out of {total} of your partner's answers.
             Your partner correctly guessed {partnerScore} of yours.
          </Text>
        </GlassCard>

        {/* Breakdown Preview */}
        <GlassCard style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Quick Breakdown</Text>
          <View style={styles.breakdownStats}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>
                {myScore}
              </Text>
              <Text style={styles.breakdownLabel}>Your Hits</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownValue}>
                {partnerScore}
              </Text>
              <Text style={styles.breakdownLabel}>Partner Hits</Text>
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
          onPress={() => navigation.replace('Summary', { roomId })}
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
  waitingEmoji: { fontSize: 56, marginBottom: Spacing.xl },
  waitingTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.displayBold,
  },
  waitingSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  partnerCard: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
  partnerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
  revealEmoji: { fontSize: 72, marginBottom: Spacing.xl },
  revealTitle: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily.displayExtrabold,
  },
  revealSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
  },
  revealButton: { width: '80%' },
  // Results
  resultBadge: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textAccent,
    fontWeight: '600',
    marginBottom: Spacing.base,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  scoreBox: {
    alignItems: 'center',
  },
  playerName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  resultTitle: {
    fontSize: Typography.fontSize['4xl'],
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.displayExtrabold,
  },
  resultSync: {
    fontSize: Typography.fontSize.xl,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
    marginTop: 16, // balance with the names above scores
  },
  compatLabel: {
    fontSize: Typography.fontSize.lg,
    color: Colors.primaryLight,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
    fontFamily: Typography.fontFamily.displayBold,
  },
  insightCard: {
    marginBottom: Spacing.xl,
    width: '100%',
  },
  insightTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily.displayBold,
  },
  insightText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontFamily: Typography.fontFamily.regular,
  },
  breakdownCard: {
    marginBottom: Spacing.xl,
    width: '100%',
  },
  breakdownTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
    fontFamily: Typography.fontFamily.displayBold,
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
    color: Colors.textPrimary,
    marginBottom: 2,
    fontFamily: Typography.fontFamily.displayExtrabold,
  },
  breakdownLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.displayBold,
  },
  breakdownDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.divider,
  },
  summaryButton: {
    width: '100%',
    fontFamily: Typography.fontFamily.displayBold,
  },
});
