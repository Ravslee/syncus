// ============================================================
// SyncUs - Home Screen
// ============================================================

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScreenWrapper} from '../components/ScreenWrapper';
import {GradientButton} from '../components/GradientButton';
import {GlassCard} from '../components/GlassCard';
import {Colors, Typography, Spacing, Shadows} from '../constants/theme';
import {RootStackParamList} from '../types';
import {useAppStore} from '../store/useAppStore';
import {signOut} from '../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAppStore();

  return (
    <ScreenWrapper scrollable>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>
            Hey, {user?.displayName ?? 'there'} 👋
          </Text>
          <Text style={styles.appBadge}>SyncUs</Text>
        </View>
        <TouchableOpacity
          onPress={signOut}
          style={styles.profileButton}>
          <Text style={styles.profileInitial}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Discover how well{'\n'}you{' '}
          <Text style={styles.heroHighlight}>sync</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Connect with your partner and find the{'\n'}perfect match through
          shared quizzes and insights
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <GradientButton
          title="Create Room"
          onPress={() => navigation.navigate('CreateRoom')}
          size="lg"
          style={styles.actionButton}
          icon={<Text style={styles.actionIcon}>🔗</Text>}
        />
        <GradientButton
          title="Join Room"
          onPress={() => navigation.navigate('JoinRoom')}
          variant="secondary"
          size="lg"
          style={styles.actionButton}
          icon={<Text style={styles.actionIcon}>🎯</Text>}
        />
      </View>

      {/* Your Sync Status */}
      <GlassCard style={styles.statsCard} variant="elevated">
        <Text style={styles.statsTitle}>● Your Sync Status</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Total Syncs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>—</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
        </View>
      </GlassCard>

      {/* Quick Links */}
      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation.navigate('History')}>
          <Text style={styles.quickLinkIcon}>📊</Text>
          <Text style={styles.quickLinkText}>Quiz History</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.base,
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  appBadge: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  profileInitial: {
    fontSize: Typography.fontSize.md,
    fontWeight: '700',
    color: Colors.white,
  },
  hero: {
    marginBottom: Spacing['2xl'],
  },
  heroTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 44,
    marginBottom: Spacing.md,
  },
  heroHighlight: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  actionButton: {
    width: '100%',
  },
  actionIcon: {
    fontSize: 18,
  },
  statsCard: {
    marginBottom: Spacing.xl,
  },
  statsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textAccent,
    marginBottom: Spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.divider,
  },
  quickLinks: {
    marginBottom: Spacing['3xl'],
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  quickLinkIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  quickLinkText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: '600',
  },
});
