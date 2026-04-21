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
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onPress,
  selected = false,
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
      <Text style={styles.name}>{category.name}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {category.description}
      </Text>
      {selected && (
        <View style={[styles.badge, { backgroundColor: Colors.primary }]}>
          <Text style={styles.badgeText}>Selected</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    padding: 16,
    width: '47%',
    marginBottom: 14,
    ...Shadows.sm,
  },
  selected: {
    backgroundColor: Colors.surfaceLight,
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
    color: Colors.textPrimary,
    marginBottom: 4,
    fontFamily: Typography.fontFamily.bold,
  },
  description: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
    fontFamily: Typography.fontFamily.semibold,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    color: Colors.white,
    fontFamily: Typography.fontFamily.bold,
  },
});
