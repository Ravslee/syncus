// ============================================================
// SyncUs - Waiting Room Screen
// ============================================================

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GlassCard } from '../components/GlassCard';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { RootStackParamList, RoomStatus } from '../types';
import { useRoom } from '../hooks/useRoom';
import { useAppStore } from '../store/useAppStore';
import { db } from '../services/firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WaitingRoom'>;
  route: RouteProp<RootStackParamList, 'WaitingRoom'>;
};

export const WaitingRoomScreen: React.FC<Props> = ({ navigation, route }) => {
  const { roomId, roomCode } = route.params;
  const { room } = useRoom(roomId);
  const { user, partner, setPartner, leaveRoom } = useAppStore();
  const partnerName = partner?.displayName ?? 'Partner';

  // Fetch partner details only when necessary
  useEffect(() => {
    const fetchPartner = async () => {
      if (!room || !user) return;

      const partnerId = room.users.find(id => id !== user.uid);
      if (partnerId && !partner) {
        try {
          const pDoc = await db.users().doc(partnerId).get();
          if (typeof pDoc.exists === 'function' ? pDoc.exists() : pDoc.exists) {
            setPartner(pDoc.data() as any);
          }
        } catch (e) {
          console.error('Failed to fetch partner:', e);
        }
      }
    };
    fetchPartner();
  }, [room, user, partner, setPartner]);

  // Navigate when both users are ready
  useEffect(() => {
    if (room && room.users.length === 2 && room.status === RoomStatus.ACTIVE) {
      const timer = setTimeout(() => {
        navigation.replace('Home');
      }, 2000); // Small delay for UX
      return () => clearTimeout(timer);
    }
  }, [room, roomId, navigation]);

  const handleLeave = async () => {
    if (user && roomId) {
      await leaveRoom(roomId, user.uid);
      navigation.replace('Lobby');
    }
  };

  const partnerJoined = room && room.users.length === 2;


  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeave} style={styles.leaveButton}>
          <Icon name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.title}>Preparing your Sync</Text>
        <Text style={styles.subtitle}>
          {partnerJoined
            ? 'Both players are here! Starting soon...'
            : 'Waiting for your partner to join'}
        </Text>

        {/* Room Code Badge */}
        <GlassCard style={styles.codeCard}>
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <Text style={styles.code}>{roomCode}</Text>
        </GlassCard>

        {/* User Slots */}
        <View style={styles.usersRow}>
          {/* User 1 (You) */}
          <View style={styles.userSlot}>
            <View style={[styles.avatar, styles.avatarFilled]}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.displayName ?? 'You'}</Text>
            <View style={styles.readyBadge}>
              <Text style={styles.readyText}>Ready ✓</Text>
            </View>
          </View>

          {/* Connection line */}
          <View style={styles.connectorContainer}>
            {partnerJoined ? (
              <Icon name="heartbeat" size={24} color={Colors.primaryLight} />

            ) : (
              <ActivityIndicator size="small" color={Colors.primaryLight} />
            )}
          </View>

          {/* User 2 (Partner) */}
          <View style={styles.userSlot}>
            <View
              style={[
                styles.avatar,
                partnerJoined ? styles.avatarFilled : styles.avatarEmpty,
              ]}>
              {partnerJoined ? (
                <Text style={styles.avatarText}>{partnerName.charAt(0).toUpperCase()}</Text>
              ) : (
                <Text style={styles.avatarPlaceholder}>?</Text>
              )}
            </View>
            <Text style={styles.userName}>
              {partnerJoined ? partnerName : 'Waiting...'}
            </Text>
            {partnerJoined && (
              <View style={styles.readyBadge}>
                <Text style={styles.readyText}>Joined ✓</Text>
              </View>
            )}
          </View>
        </View>

        {!partnerJoined && (
          <Text style={styles.hint}>
            Share the room code above with your partner
          </Text>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: Spacing.base,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  leaveButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: -40, // Offset for the header
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.extrabold,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    fontFamily: Typography.fontFamily.semibold,
  },
  codeCard: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing['3xl'],
  },
  codeLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.semibold,
  },
  code: {
    fontSize: Typography.fontSize.xl,
    color: Colors.primary,
    letterSpacing: 4,
    fontFamily: Typography.fontFamily.extrabold,
  },
  usersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['2xl'],
    gap: Spacing.xl,
  },
  userSlot: {
    alignItems: 'center',
    width: 100,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarFilled: {
    backgroundColor: Colors.primary,
    ...Shadows.glow,
  },
  avatarEmpty: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.glassBorder,
    borderStyle: 'dashed',
  },
  avatarText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
  },
  avatarPlaceholder: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textMuted,
    fontFamily: Typography.fontFamily.bold,
  },
  userName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.semibold,
  },
  readyBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 99,
  },
  readyText: {
    fontSize: 10,
    color: Colors.success,
    fontFamily: Typography.fontFamily.bold,
  },
  connectorContainer: {
    marginTop: -30,
  },
  connectedIcon: {
    fontSize: 24,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: Typography.fontFamily.regular,
  },
});
