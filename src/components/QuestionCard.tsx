// ============================================================
// SyncUs - Question Card Component
// ============================================================

import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {Colors, BorderRadius, Typography} from '../constants/theme';

interface QuestionCardProps {
  option: string;
  index: number;
  selected: boolean;
  onPress: (index: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  option,
  index,
  selected,
  onPress,
}) => {
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(index)}
      style={[styles.card, selected && styles.selected]}>
      <View style={[styles.label, selected && styles.labelSelected]}>
        <Text style={[styles.labelText, selected && styles.labelTextSelected]}>
          {labels[index]}
        </Text>
      </View>
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {option}
      </Text>
      {selected && (
        <View style={styles.check}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    padding: 16,
    marginBottom: 12,
  },
  selected: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  label: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  labelSelected: {
    backgroundColor: Colors.primary,
  },
  labelText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  labelTextSelected: {
    color: Colors.white,
  },
  optionText: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
