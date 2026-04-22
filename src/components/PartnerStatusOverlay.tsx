// ============================================================
// SyncUs - Partner Status Overlay Component
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Typography, Spacing } from '../constants/theme';
import { RoomState, UserRoomStatus } from '../types';
import { useAppStore } from '../store/useAppStore';

interface PartnerStatusOverlayProps {
  partnerStatus: RoomState | null;
  totalQuestions: number;
}

export const PartnerStatusOverlay: React.FC<PartnerStatusOverlayProps> = ({
  partnerStatus,
  totalQuestions,
}) => {
  const { partner } = useAppStore();
  const partnerName = partner?.displayName ? partner.displayName.split(' ')[0] : 'Partner';

  const getStatusText = () => {
    if (!partnerStatus) {
      return `Waiting for ${partnerName}...`;
    }

    switch (partnerStatus.status) {
      case UserRoomStatus.JOINED:
        return `${partnerName} is getting ready...`;
      case UserRoomStatus.ANSWERING:
        return `${partnerName}: Question ${partnerStatus.currentQuestionIndex + 1}/${totalQuestions}`;
      case UserRoomStatus.COMPLETED:
        return `${partnerName} has finished!`;
      default:
        return `Syncing with ${partnerName}...`;
    }
  };

  const getStatusColor = () => {
    if (!partnerStatus) {
      return Colors.warning;
    }
    switch (partnerStatus.status) {
      case UserRoomStatus.COMPLETED:
        return Colors.success;
      case UserRoomStatus.ANSWERING:
        return Colors.info;
      default:
        return Colors.warning;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    // borderRadius: BorderRadius.full,
    borderBottomLeftRadius: BorderRadius.full,
    borderTopLeftRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    // borderWidth: 1,
    // borderColor: Colors.glassBorder,
    alignSelf: 'flex-end',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textAccent,
    fontWeight: '500',
    fontFamily: Typography.fontFamily.medium,
  },
});
