// ============================================================
// SyncUs - Lobby Screen
// ============================================================

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { RootStackParamList, Room, RoomStatus } from '../types';
import { useAppStore } from '../store/useAppStore';
import { getActiveRoomForUser } from '../services/roomService';
import { LobbyIllustration } from '../components/LobbyIllustration';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Lobby'>;
};

export const LobbyScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setRoom } = useAppStore();
  const [loadingRoom, setLoadingRoom] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      if (!user) return;

      const fetchRoom = async () => {
        setLoadingRoom(true);
        try {
          const room = await getActiveRoomForUser(user.uid);
          if (active && room) {
            setRoom(room);
            // If both users are already in the room, skip WaitingRoom and go straight to Home
            if (room.status === RoomStatus.ACTIVE && room.users.length === 2) {
              navigation.replace('Home');
            } else {
              navigation.replace('WaitingRoom', { roomId: room.id, roomCode: room.code });
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (active) setLoadingRoom(false);
        }
      };

      fetchRoom();
      return () => { active = false; };
    }, [user, navigation, setRoom])
  );

  if (loadingRoom) {
    return (
      <ScreenWrapper>
        <View style={[styles.flexCenter, { flex: 1 }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

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
          onPress={() => Alert.alert('Profile', 'Profile feature coming soon!')}
          style={styles.profileButton}>
          <Text style={styles.profileInitial}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.flexCenter}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <LobbyIllustration width="100%" height="100%" />
        </View>

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
        />
        <GradientButton
          title="Join Room"
          onPress={() => navigation.navigate('JoinRoom')}
          variant="secondary"
          size="lg"
          style={styles.actionButton}
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
    color: Colors.textPrimary,
    letterSpacing: 0.5,
    fontFamily: Typography.fontFamily.extrabold,
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
  illustrationContainer: {
    height: 300,
    width: '100%',
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  hero: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: Typography.fontSize['3xl'],
    color: Colors.textPrimary,
    lineHeight: 44,
    marginBottom: Spacing.md,
    fontFamily: Typography.fontFamily.displayExtrabold,
  },
  heroHighlight: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: 22,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
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
