// ============================================================
// SyncUs - Home Screen
// ============================================================

import React, {useState, useCallback} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useFocusEffect} from '@react-navigation/native';
import {ScreenWrapper} from '../components/ScreenWrapper';
import {GradientButton} from '../components/GradientButton';
import {CategoryCard} from '../components/CategoryCard';
import {Colors, Typography, Spacing, Shadows} from '../constants/theme';
import {RootStackParamList, Category, UserRoomStatus} from '../types';
import {CATEGORIES} from '../constants';
import {updateRoomCategory} from '../services/roomService';
import {useAppStore} from '../store/useAppStore';
import {db} from '../services/firebase';
import {signOut} from '../services/authService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {user, room, resetQuiz} = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [partnerName, setPartnerName] = useState<string>('your partner');

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
      await updateRoomCategory(room.id, selectedCategory.id);
      navigation.navigate('Quiz', {roomId: room.id, categoryId: selectedCategory.id});
    } catch (error) {
      console.error('Failed to set category:', error);
    } finally {
      setLoading(false);
    }
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
        <TouchableOpacity onPress={signOut} style={styles.profileButton}>
          <Text style={styles.profileInitial}>
            {user?.displayName?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.badge}>CHOOSE A VIBE</Text>
        <Text style={styles.title}>What's the topic?</Text>
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
          title="Start Quiz 🚀"
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
  container: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  badge: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing['2xl'],
    lineHeight: 22,
  },
  partnerName: {
    color: Colors.primaryLight,
    fontWeight: '700',
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
