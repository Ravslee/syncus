// ============================================================
// SyncUs - Onboarding Screen
// ============================================================

import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScreenWrapper} from '../components/ScreenWrapper';
import {GradientButton} from '../components/GradientButton';
import {GlassCard} from '../components/GlassCard';
import {Colors, Typography, BorderRadius, Spacing} from '../constants/theme';
import {RootStackParamList} from '../types';
import {createUserProfile, getCurrentUser} from '../services/authService';
import {useAppStore} from '../store/useAppStore';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
};

export const OnboardingScreen: React.FC<Props> = ({navigation}) => {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const {setUser, setOnboarded} = useAppStore();

  const handleComplete = async () => {
    const name = displayName.trim();
    if (!name) {
      Alert.alert('Hold on!', 'Please enter your name to continue');
      return;
    }

    if (name.length < 2) {
      Alert.alert('Oops', 'Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    try {
      const firebaseUser = getCurrentUser();
      if (!firebaseUser) {
        throw new Error('No authenticated user found');
      }

      const email = firebaseUser.email ?? '';
      await createUserProfile(firebaseUser.uid, email, name);

      setUser({
        uid: firebaseUser.uid,
        email,
        displayName: name,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      });
      setOnboarded(true);

      // Navigation handled by auth state in AppNavigator
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper keyboardAvoiding>
      <View style={styles.container}>
        {/* Illustration */}
        <View style={styles.illustration}>
          <Text style={styles.emoji}>👋</Text>
        </View>

        <Text style={styles.title}>Welcome to SyncUs!</Text>
        <Text style={styles.subtitle}>
          Let's get to know you. What should we call you?
        </Text>

        <GlassCard style={styles.card} variant="elevated">
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textMuted}
              value={displayName}
              onChangeText={setDisplayName}
              autoFocus
              maxLength={30}
              autoCapitalize="words"
            />
          </View>

          <Text style={styles.hint}>
            This is how your partner will see you in quiz rooms
          </Text>
        </GlassCard>

        <GradientButton
          title="Let's Go! 🚀"
          onPress={handleComplete}
          loading={loading}
          size="lg"
          style={styles.button}
          disabled={!displayName.trim()}
        />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  illustration: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  emoji: {
    fontSize: 72,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  card: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.backgroundLight,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: Spacing.base,
    paddingVertical: 14,
    fontSize: Typography.fontSize.md,
    color: Colors.white,
  },
  hint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  button: {
    alignSelf: 'stretch',
  },
});
