// ============================================================
// SyncUs - Home Screen
// ============================================================

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal, Pressable, BackHandler, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GradientButton } from '../components/GradientButton';
import { SpinWheelModal } from '../components/SpinWheelModal';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../constants/theme';
import { RootStackParamList, Category, UserRoomStatus, RoomStatus } from '../types';
import { CATEGORIES } from '../constants';
import { updateRoomCategory } from '../services/roomService';
import { useAppStore } from '../store/useAppStore';
import { useRoomPresence } from '../hooks/useRoomPresence';
import { useRoom } from '../hooks/useRoom';
import { db } from '../services/firebase';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { GlassCard } from '../components/GlassCard';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user, room, partner, myStatus, resetQuiz, leaveRoom } = useAppStore();
  useRoom(room?.id);
  const { partnerStatus } = useRoomPresence(room?.id);
  const [loading, setLoading] = useState(false);
  const partnerName = partner?.displayName ?? 'your partner';
  const [menuVisible, setMenuVisible] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const pulseAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [pulseAnim]);

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
      const resetState = async () => {
        if (user && room) {
          try {
            const stateId = `${room.id}__${user.uid}`;
            await db.roomStates().doc(stateId).update({
              status: UserRoomStatus.JOINED,
              currentQuestionIndex: 0,
              completedAt: null,
            });
            // Clear stale categoryId from previous round
            await db.rooms().doc(room.id).update({ categoryId: '' });
          } catch (err) {
            console.error('Failed to reset room state:', err);
          }
        }
      };
      resetState();

      return () => {
        subscription.remove();
      };
    }, [user, room, resetQuiz])
  );

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };


  const isMyQuizActive =
    myStatus?.status === UserRoomStatus.ANSWERING ||
    myStatus?.status === UserRoomStatus.WAITING_FOR_PARTNER ||
    myStatus?.status === UserRoomStatus.GUESSING;

  const canJoinQuiz = !!room?.categoryId;
  const isFocused = useIsFocused();

  // If the partner starts a quiz while the spin wheel is open, close it and show the join modal
  React.useEffect(() => {
    if (canJoinQuiz && showSpinWheel) {
      setShowSpinWheel(false);
      setShowPartnerModal(true);
    }
  }, [canJoinQuiz, showSpinWheel]);

  // #3: Partner left room detection
  React.useEffect(() => {
    if (room?.status === RoomStatus.COMPLETED && room?.users.length < 2 && isFocused) {
      Alert.alert(
        'Room Closed',
        'Your partner has left the room. Moving you back to Lobby.',
        [{
          text: 'OK', onPress: () => {
            resetQuiz();
            if (user && room) leaveRoom(room.id, user.uid);
            navigation.replace('Lobby');
          }
        }]
      );
    }
  }, [room?.status, room?.users.length, isFocused]);

  const handlePlayClick = () => {
    if (canJoinQuiz) {
      setShowPartnerModal(true);
    } else {
      setShowSpinWheel(true);
    }
  };

  const handleCategorySelected = async (category: Category) => {
    setShowSpinWheel(false);
    setShowPartnerModal(false);
    if (!room || !user) {
      Alert.alert('Error', 'You must be in a room to start.');
      return;
    }

    setLoading(true);
    try {
      // 1. Lock the category in the room immediately to notify partner
      await updateRoomCategory(room.id, category.id);

      const { clearRoomAnswers, updateProgress } = await import('../services/quizService');
      
      // 2. Clear old answers and update our own progress
      await clearRoomAnswers(room.id, user.uid, category.id);
      await updateProgress(room.id, user.uid, 0, UserRoomStatus.ANSWERING);
      
      navigation.navigate('Quiz', { roomId: room.id, categoryId: category.id });
    } catch (error) {
      console.error('Failed to set category:', error);
      Alert.alert('Error', 'This category might have already been selected by your partner.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinQuiz = async () => {
    setShowPartnerModal(false);
    if (!room || !user || !room.categoryId) return;

    setLoading(true);
    try {
      const { clearRoomAnswers, updateProgress } = await import('../services/quizService');
      await clearRoomAnswers(room.id, user.uid, room.categoryId);
      await updateProgress(room.id, user.uid, 0, UserRoomStatus.ANSWERING);
      navigation.navigate('Quiz', { roomId: room.id, categoryId: room.categoryId });
    } catch (e) {
      console.error('Failed to join quiz:', e);
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

  const partnerCategory = CATEGORIES.find(c => c.id === room?.categoryId);

  return (
    <ScreenWrapper scrollable>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.appBadge}>Syncus</Text>
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

      {/* Partner Started Modal */}
      <Modal visible={showPartnerModal} transparent animationType="fade" onRequestClose={() => setShowPartnerModal(false)}>
        <View style={styles.partnerModalOverlay}>
          <View style={styles.partnerModalContent}>
            <Text style={styles.partnerModalTitle}>Your Partner Spun!</Text>
            <Text style={styles.partnerModalSubtitle}>
              {partnerName} already chose a vibe. Get ready to play:
            </Text>
            {partnerCategory && (
              <View style={[styles.categoryBadge, { backgroundColor: partnerCategory.color + '20' }]}>
                <Text style={styles.categoryBadgeIcon}>{partnerCategory.icon}</Text>
                <Text style={[styles.categoryBadgeText, { color: partnerCategory.color }]}>
                  {partnerCategory.name}
                </Text>
              </View>
            )}
            <GradientButton
              title="Join Quiz"
              onPress={handleJoinQuiz}
              size="lg"
              style={{ width: '100%', marginTop: Spacing.xl }}
            />
            <TouchableOpacity onPress={() => setShowPartnerModal(false)} style={styles.closeModalButton}>
              <Text style={styles.closeModalText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Spin Wheel Modal */}
      <SpinWheelModal
        visible={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        onCategorySelected={handleCategorySelected}
      />

      <View style={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.title}>Ready to play?</Text>
          <Text style={styles.subtitle}>
            You are paired with <Text style={styles.partnerName}>{partnerName}</Text>. Let fate choose your vibe!
          </Text>

          {/* Avatars */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.primary }]}>
                <Text style={[styles.avatarText, { color: Colors.primary }]}>{getInitials(user?.displayName)}</Text>
              </View>
              <Text style={styles.avatarLabel}>You</Text>
            </View>

            <View style={styles.connectionLine}>
              <Icon name="cards-heart" size={28} color={Colors.textAccent} />
            </View>

            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.primaryLight }]}>
                <Text style={[styles.avatarText, { color: Colors.primaryLight }]}>{getInitials(partnerName)}</Text>
              </View>
              <Text style={styles.avatarLabel}>{partnerName}</Text>
            </View>
          </View>

          {/* Ongoing Quiz Resume Section */}
          {isMyQuizActive && room?.categoryId && (
            <GlassCard style={styles.resumeCard}>
              <View style={styles.resumeInfo}>
                <View style={styles.resumeIcon}>
                  <Icon name="play-circle" size={32} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.resumeTitle}>Quiz in Progress</Text>
                  <Text style={styles.resumeSubtitle}>
                    You were in the middle of a {CATEGORIES.find(c => c.id === room.categoryId)?.name} session.
                  </Text>
                </View>
              </View>
              <GradientButton
                title="Resume Quiz"
                onPress={() => navigation.navigate('Quiz', { roomId: room.id, categoryId: room.categoryId })}
                style={styles.resumeButton}
              />
            </GlassCard>
          )}

          {/* Play Button */}
          <View style={styles.playContainer}>
            <Animated.View
              style={[
                styles.rippleEffect,
                {
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.8],
                      }),
                    },
                  ],
                  opacity: pulseAnim.interpolate({
                    inputRange: [0, 0.8, 1],
                    outputRange: [0.6, 0, 0],
                  }),
                },
              ]}
            />
            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlayClick}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View style={[styles.playButtonInner, loading && { opacity: 0.7 }]}>
                <Icon name="play" size={56} color={Colors.primaryDark} style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>
            <Text style={styles.playHintText}>{canJoinQuiz ? "Tap to Join" : "Tap to Spin"}</Text>
          </View>
        </View>
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
  resumeCard: {
    width: '90%',
    marginTop: -Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  resumeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.base,
  },
  resumeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumeTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.bold,
  },
  resumeSubtitle: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontFamily: Typography.fontFamily.regular,
  },
  resumeButton: {
    height: 48,
  },
  appBadge: {
    fontSize: Typography.fontSize['2xl'],
    color: Colors.textAccent,
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
    flex: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    color: Colors.textAccent,
    marginBottom: Spacing.sm,
    fontFamily: Typography.fontFamily.extrabold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textPrimary,
    marginBottom: Spacing['3xl'],
    lineHeight: 26,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  partnerName: {
    color: Colors.primaryLight,
    fontFamily: Typography.fontFamily.bold,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing['3xl'] * 1.5,
  },
  avatarWrapper: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  avatarText: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
  },
  avatarLabel: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.medium,
  },
  connectionLine: {
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleEffect: {
    position: 'absolute',
    top: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
  },
  playButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
    elevation: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  playButtonInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  playHintText: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSize.base,
    color: Colors.textAccent,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  partnerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  partnerModalContent: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    ...Shadows.glow,
  },
  partnerModalTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  partnerModalSubtitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
  },
  categoryBadgeIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  categoryBadgeText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  closeModalButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
  },
  closeModalText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
});
