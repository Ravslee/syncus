// ============================================================
// SyncUs - Partner Status Overlay Component
// ============================================================

import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, BorderRadius, Typography} from '../constants/theme';
import {RoomState, UserRoomStatus} from '../types';

interface PartnerStatusOverlayProps {
  partnerStatus: RoomState | null;
  totalQuestions: number;
}

export const PartnerStatusOverlay: React.FC<PartnerStatusOverlayProps> = ({
  partnerStatus,
  totalQuestions,
}) => {
  const getStatusText = () => {
    if (!partnerStatus) {
      return 'Waiting for partner to join...';
    }

    switch (partnerStatus.status) {
      case UserRoomStatus.JOINED:
        return 'Your partner is getting ready...';
      case UserRoomStatus.ANSWERING:
        return `Your partner is on question ${partnerStatus.currentQuestionIndex + 1} of ${totalQuestions}`;
      case UserRoomStatus.COMPLETED:
        return 'Your partner has finished! 🎉';
      default:
        return 'Syncing with partner...';
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
      <View style={[styles.dot, {backgroundColor: getStatusColor()}]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignSelf: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
