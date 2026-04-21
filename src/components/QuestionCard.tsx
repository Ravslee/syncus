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
  isCorrect?: boolean;
  isWrong?: boolean;
  onPress: (index: number) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  option,
  index,
  selected,
  isCorrect,
  isWrong,
  onPress,
}) => {
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(index)}
      style={[
        styles.card,
        selected && styles.selected,
        isCorrect && styles.correct,
        isWrong && styles.wrong
      ]}>
      <View style={[
        styles.label,
        selected && styles.labelSelected,
        isCorrect && styles.labelCorrect,
        isWrong && styles.labelWrong
      ]}>
        <Text style={[
          styles.labelText,
          (selected || isCorrect || isWrong) && styles.labelTextSelected
        ]}>
          {labels[index]}
        </Text>
      </View>
      <Text style={[
        styles.optionText,
        selected && styles.optionTextSelected,
        isCorrect && styles.optionTextCorrect,
        isWrong && styles.optionTextWrong
      ]}>
        {option}
      </Text>
      {selected && !isCorrect && !isWrong && (
        <View style={styles.check}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
      {isCorrect && (
        <View style={[styles.check, {backgroundColor: Colors.success}]}>
          <Text style={styles.checkText}>✓</Text>
        </View>
      )}
      {isWrong && (
        <View style={[styles.check, {backgroundColor: Colors.error}]}>
          <Text style={styles.checkText}>✗</Text>
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
  correct: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  wrong: {
    backgroundColor: Colors.error + '20',
    borderColor: Colors.error,
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
  labelCorrect: {
    backgroundColor: Colors.success,
  },
  labelWrong: {
    backgroundColor: Colors.error,
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
  optionTextCorrect: {
    color: Colors.success,
    fontWeight: '600',
  },
  optionTextWrong: {
    color: Colors.error,
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
