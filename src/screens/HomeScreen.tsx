// ============================================================
// SyncUs - Home Screen
// ============================================================

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable, BackHandler } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GradientButton } from '../components/GradientButton';
import { CategoryCard } from '../components/CategoryCard';
import { Colors, Typography, Spacing, Shadows } from '../constants/theme';
import { RootStackParamList, Category, UserRoomStatus } from '../types';
import { CATEGORIES } from '../constants';
import { updateRoomCategory } from '../services/roomService';
import { useAppStore } from '../store/useAppStore';
import { db } from '../services/firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, room, resetQuiz, leaveRoom } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState<string>('your partner');
  const [menuVisible, setMenuVisible] = useState(false);

  // Fetch partner name
  React.useEffect(() => {
    const fetchPartner = async () => {
      if (!room || !user) return;
      const partnerId = room.users.find(id => id !== user.uid);
      if (partnerId) {
        try {
          const pDoc = await db.users().doc(partnerId).get();
          if (typeof pDoc.exists === 'function' ? pDoc.exists() : pDoc.exists) {
            setPartnerName(pDoc.data()?.displayName ?? 'your partner');
          }
        } catch (e) {
          console.error('Failed to fetch partner:', e);
        }
      }
    };
    fetchPartner();
  }, [room, user]);

  // Reset quiz state when returning to this screen for a new quiz
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true; // true means we handled it
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      resetQuiz();

      // Update local state in Firestore so partner knows we are waiting
      if (user && room) {
        const stateId = `${room.id}__${user.uid}`;
        db.roomStates().doc(stateId).update({
          status: UserRoomStatus.JOINED,
          currentQuestionIndex: 0,
          completedAt: null,
        }).catch(err => console.error('Failed to reset room state:', err));
      }

      return () => {
        subscription.remove();
      };
    }, [user, room, resetQuiz])
  );

  const handleSelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleStart = async () => {
    if (!selectedCategory || !room) {
      if (!room) Alert.alert('Error', 'You must be in a room to start.');
      return;
    }

    setLoading(true);
    try {
      const { clearRoomAnswers } = await import('../services/quizService');
      if (user && room) {
        await clearRoomAnswers(room.id, user.uid, selectedCategory.id);
      }
      await updateRoomCategory(room.id, selectedCategory.id);
      navigation.navigate('Quiz', { roomId: room.id, categoryId: selectedCategory.id });
    } catch (error) {
      console.error('Failed to set category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExitRoom = async () => {
    if (room && user) {
      setMenuVisible(false);
      await leaveRoom(room.id, user.uid);
      navigation.replace('Lobby');
    } else {
      handleProfile(); // Fallback if somehow state is missing
    }
  };

  const handleProfile = () => {
    setMenuVisible(false);
    Alert.alert('Profile', 'Profile feature coming soon!'); // Placeholder
  };

  return (
    <ScreenWrapper scrollable>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>
            Hey, {user?.displayName ?? 'there'} 👋
          </Text>
          <Text style={styles.appBadge}>SyncUs Room</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
          <Icon name="dots-vertical" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.dropdownMenu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleProfile}>
              <Icon name="account" size={20} color={Colors.textPrimary} style={styles.menuIcon} />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleExitRoom}>
              <Icon name="exit-run" size={20} color={Colors.error} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: Colors.error }]}>Exit Room</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <View style={styles.container}>
        <Text style={styles.badge}>CHOOSE A VIBE</Text>
        <Text style={styles.title}>A little quiz, a lot of discovery</Text>

        <Text style={styles.subtitle}>
          You are paired with <Text style={styles.partnerName}>{partnerName}</Text>. Select a category to start your daily sync!
        </Text>

        {/* Category Grid */}
        <View style={styles.grid}>
          {CATEGORIES.map(category => (
            <CategoryCard
              key={category.id}
              category={category}
              onPress={handleSelect}
              selected={selectedCategory?.id === category.id}
            />
          ))}
        </View>

        <GradientButton
          title="Start Quiz"
          onPress={handleStart}
          disabled={!selectedCategory}
          loading={loading}
          size="lg"
          style={styles.continueButton}
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
    marginBottom: Spacing.md,
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
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  dropdownMenu: {
    backgroundColor: Colors.surface,
    marginTop: 60,
    marginRight: Spacing.lg,
    borderRadius: Spacing.md,
    paddingVertical: Spacing.sm,
    width: 180,
    ...Shadows.glow,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  menuIcon: {
    marginRight: Spacing.sm,
  },
  menuText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
  },
  container: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
    // fontFamily: Typography.fontFamily.regular,
  },
  badge: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily.extrabold,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    // fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
    fontFamily: Typography.fontFamily.regular,
  },
  partnerName: {
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  continueButton: {
    width: '100%',
  },
});
