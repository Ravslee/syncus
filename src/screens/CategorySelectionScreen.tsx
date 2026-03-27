// ============================================================
// SyncUs - Category Selection Screen
// ============================================================

import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {ScreenWrapper} from '../components/ScreenWrapper';
import {GradientButton} from '../components/GradientButton';
import {CategoryCard} from '../components/CategoryCard';
import {Colors, Typography, Spacing} from '../constants/theme';
import {RootStackParamList, Category} from '../types';
import {CATEGORIES} from '../constants';
import {updateRoomCategory} from '../services/roomService';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CategorySelection'>;
  route: RouteProp<RootStackParamList, 'CategorySelection'>;
};

export const CategorySelectionScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const {roomId} = route.params;
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (category: Category) => {
    setSelectedCategory(category);
  };

  const handleContinue = async () => {
    if (!selectedCategory) {
      return;
    }

    setLoading(true);
    try {
      await updateRoomCategory(roomId, selectedCategory.id);
      navigation.replace('Quiz', {roomId, categoryId: selectedCategory.id});
    } catch (error) {
      console.error('Failed to set category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        <Text style={styles.badge}>CHOOSE A VIBE</Text>
        <Text style={styles.title}>Choose a Vibe</Text>
        <Text style={styles.subtitle}>
          Select a category to start your daily sync. The quizzes change
          regularly!
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
          title="Start Exploring →"
          onPress={handleContinue}
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
  container: {
    paddingTop: Spacing.xl,
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
