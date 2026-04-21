// ============================================================
// SyncUs - Glass Card Component
// ============================================================

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Shadows } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  variant?: 'default' | 'elevated' | 'subtle';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padded = true,
  variant = 'default',
}) => {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        variant === 'elevated' && styles.elevated,
        variant === 'subtle' && styles.subtle,
        style,
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  padded: {
    padding: 16,
  },
  elevated: {
    backgroundColor: Colors.surface,
    borderColor: Colors.glassHighlight,
    ...Shadows.md,
  },
  subtle: {
    // backgroundColor: 'rgba(255, 255, 255, 0.03)',
    // borderColor: 'rgba(255, 255, 255, 0.06)',

    backgroundColor: Colors.glass,
    borderColor: Colors.glassBorder,
  },
});
