// ============================================================
// SyncUs - Lobby Screen
// ============================================================

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScreenWrapper} from '../components/ScreenWrapper';
import {GradientButton} from '../components/GradientButton';
import {Colors, Typography, Spacing, Shadows} from '../constants/theme';
import {RootStackParamList} from '../types';
import {useAppStore} from '../store/useAppStore';
import {signOut} from '../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Lobby'>;
};

export const LobbyScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAppStore();

  return (
    <ScreenWrapper>
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

      <View style={styles.flexCenter}>
        {/* Hero Section */}
        <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          Discover how well{'\n'}you{' '}
          <Text style={styles.heroHighlight}>sync</Text>
        </Text>
        <Text style={styles.heroSubtitle}>
          Invite your partner, answer fun relationship questions, and explore your compatibility together.
        </Text>
        </View>
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
  flexCenter: {
    flex: 1,
    justifyContent: 'center',
  },
  hero: {
    marginBottom: Spacing.xl,
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
});
