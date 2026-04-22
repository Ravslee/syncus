// ============================================================
// SyncUs - Gradient Button Component
// ============================================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors, Gradients, BorderRadius, Typography, Shadows } from '../constants/theme';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  style,
  textStyle,
  icon,
}) => {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`size_${size}`],
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    variant === 'outline' && styles.outline,
    disabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${size}`],
    variant === 'outline' && styles.outlineText,
    disabled && styles.disabledText,
    textStyle as TextStyle,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyles}>
      {loading ? (
        <ActivityIndicator color={Colors.white} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    ...Shadows.lg,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },

  // Sizes
  size_sm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  size_lg: {
    paddingVertical: 18,
    paddingHorizontal: 36,
  },

  // Text
  text: {
    color: Colors.primaryDark,
    textAlign: 'center',
    fontFamily: Typography.fontFamily.displayExtrabold,
  },
  text_sm: {
    fontSize: Typography.fontSize.sm,
  },
  text_md: {
    fontSize: Typography.fontSize.md,
  },
  text_lg: {
    fontSize: Typography.fontSize.lg,
  },
  outlineText: {
    color: Colors.primary,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
