// ============================================================
// SyncUs - Create Room Screen
// ============================================================

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Share, Alert, ActivityIndicator, TouchableOpacity, Clipboard } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { RootStackParamList, RoomStatus } from '../types';
import { useAppStore } from '../store/useAppStore';
import { createRoom, listenToRoom } from '../services/roomService';
import Icon from 'react-native-vector-icons/FontAwesome';
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateRoom'>;
};

export const CreateRoomScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAppStore();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create room on mount
  useEffect(() => {
    const initRoom = async () => {
      if (!user) {
        return;
      }
      try {
        const room = await createRoom(user.uid);
        setRoomId(room.id);
        setRoomCode(room.code);
      } catch (err: any) {
        setError(err.message || 'Failed to create room');
      } finally {
        setLoading(false);
      }
    };
    initRoom();
  }, [user]);

  // Listen for partner joining
  useEffect(() => {
    if (!roomId) {
      return;
    }

    const unsubscribe = listenToRoom(roomId, (room) => {
      if (room && room.status === RoomStatus.ACTIVE && room.users.length === 2) {
        navigation.replace('WaitingRoom', { roomId: room.id, roomCode: room.code });
      }
    });

    return () => unsubscribe();
  }, [roomId, navigation]);

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join my SyncUs room! Use code: ${roomCode}`,
      });
    } catch {
      // User cancelled share
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Creating your room...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.centerContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorText}>{error}</Text>
          <GradientButton
            title="Go Back"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Room Created!</Text>
        <Text style={styles.subtitle}>
          Share this code with your partner to start the quiz
        </Text>

        {/* Code Display */}
        <GlassCard style={styles.codeCard} variant="elevated">
          <Text style={styles.codeLabel}>ROOM CODE</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{roomCode}</Text>
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(roomCode);
                Alert.alert('Copied!', 'Room code copied to clipboard.');
              }}
              style={styles.copyButton}
            >
              <Icon name="copy" size={18} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </GlassCard>

        <GradientButton
          title="Share Code"
          onPress={handleShareCode}
          size="lg"
          style={styles.shareButton}
          icon={<Text style={{ fontSize: 16 }}>📤</Text>}
        />

        {/* Waiting Status */}
        <View style={styles.waitingSection}>
          <ActivityIndicator size="small" color={Colors.primaryLight} />
          <Text style={styles.waitingText}>
            Waiting for your partner to join...
          </Text>
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  codeCard: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: Spacing['2xl'],
    marginBottom: Spacing.xl,

  },
  codeLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.base,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 8,
  },
  copyButton: {
    padding: 8,
  },
  copyIcon: {
    fontSize: 22,
  },
  shareButton: {
    width: '100%',
    marginBottom: Spacing['2xl'],
  },
  waitingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  waitingText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: Spacing.base,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
});
