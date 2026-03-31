// ============================================================
// SyncUs - Join Room Screen
// ============================================================

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GradientButton } from '../components/GradientButton';
import { GlassCard } from '../components/GlassCard';
import { CodeInput } from '../components/CodeInput';
import { Colors, Typography, Spacing } from '../constants/theme';
import { RootStackParamList } from '../types';
import { useAppStore } from '../store/useAppStore';
import { joinRoom } from '../services/roomService';
import { ROOM_CODE_LENGTH } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'JoinRoom'>;
};

export const JoinRoomScreen: React.FC<Props> = ({ navigation }) => {
  const { user, resetQuiz } = useAppStore();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (roomCode?: string) => {
    const joinCode = roomCode || code;
    if (joinCode.length !== ROOM_CODE_LENGTH) {
      Alert.alert('Invalid Code', `Please enter a ${ROOM_CODE_LENGTH}-character code`);
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please sign in first');
      return;
    }

    setLoading(true);
    resetQuiz();
    try {
      const room = await joinRoom(joinCode, user.uid);
      navigation.replace('WaitingRoom', { roomId: room.id, roomCode: room.code });
    } catch (error: any) {
      Alert.alert('Join Error', error.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper keyboardAvoiding>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔮</Text>
        </View>

        <Text style={styles.title}>Join a Room</Text>
        <Text style={styles.subtitle}>
          Enter the 5-character room code to connect with your partner and start syncing.
        </Text>

        <GlassCard style={styles.card} variant="elevated">
          <CodeInput
            value={code}
            onChange={setCode}
            onComplete={handleJoin}
          />
        </GlassCard>

        <GradientButton
          title="Join Room"
          onPress={() => handleJoin()}
          loading={loading}
          disabled={code.length !== ROOM_CODE_LENGTH}
          size="lg"
          style={styles.joinButton}
        />

        <GradientButton
          title="Go Back"
          onPress={() => navigation.goBack()}
          variant="outline"
          size="md"
        />
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
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 56,
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
    lineHeight: 22,
    paddingHorizontal: Spacing.base,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    // width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing['xl'],
    marginBottom: Spacing.xl,
  },
  joinButton: {
    width: '100%',
    marginBottom: Spacing.base,
  },
});
