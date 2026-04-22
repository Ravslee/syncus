// ============================================================
// SyncUs - Category Card Component
// ============================================================

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, BorderRadius, Shadows, Typography } from '../constants/theme';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onPress: (category: Category) => void;
  selected?: boolean;
  isActiveQuiz?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  selected = false,
  isActiveQuiz = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(category)}
      style={[
        styles.card,
        { borderColor: selected ? Colors.primary : Colors.glassBorder },
        selected && styles.selected,
      ]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: Colors.primary + '20' },
        ]}>
        <Text style={styles.icon}>{category.icon}</Text>
      </View>
      <Text style={[styles.name, selected && { color: Colors.surfaceDark }]}>{category.name}</Text>
      {isActiveQuiz && (
        <View style={[styles.activeBadge, { backgroundColor: selected ? Colors.surface : Colors.primary }]}>
          <Text style={[styles.activeBadgeText, { color: selected ? Colors.primary : Colors.textPrimary }]}>LIVE</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 0,
    padding: 16,
    width: '47%',
    marginBottom: 14,
    ...Shadows.sm,
  },
  selected: {
    backgroundColor: Colors.surfaceAccent,
    color: Colors.surfaceDark,

  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 24,
  },
  name: {
    fontSize: Typography.fontSize.base,
    color: Colors.textAccent,
    marginBottom: 4,
    fontFamily: Typography.fontFamily.bold,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textAccent,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.semibold,
  },
  activeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  activeBadgeText: {
    fontSize: 9,
    fontFamily: Typography.fontFamily.bold,
    letterSpacing: 1,
  },
});
