// ============================================================
// SyncUs - History Screen
// ============================================================

import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {ScreenWrapper} from '../components/ScreenWrapper';
import {GlassCard} from '../components/GlassCard';
import {Colors, Typography, Spacing, BorderRadius} from '../constants/theme';
import {RootStackParamList, Result} from '../types';
import {useResults} from '../hooks/useResults';
import {CATEGORIES} from '../constants';
import {formatDate, getCompatibilityLabel} from '../utils/formatters';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'History'>;
};

export const HistoryScreen: React.FC<Props> = ({navigation}) => {
  const {history, loading, loadHistory} = useResults('');

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const renderHistoryItem = ({item}: {item: Result}) => {
    const category = CATEGORIES.find(c => c.id === item.categoryId);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Summary', {roomId: item.roomId})}>
        <GlassCard style={styles.historyCard} variant="elevated">
          <View style={styles.cardHeader}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryEmoji}>{category?.icon ?? '📝'}</Text>
              <Text style={styles.categoryName}>{category?.name ?? 'Quiz'}</Text>
            </View>
            <Text style={styles.date}>{formatDate(item.calculatedAt)}</Text>
          </View>

          <View style={styles.scoreRow}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreValue}>{item.score}%</Text>
            </View>
            <View style={styles.scoreInfo}>
              <Text style={styles.compatLabel}>
                {getCompatibilityLabel(item.score)}
              </Text>
              <Text style={styles.questionCount}>
                {item.totalQuestions} questions •{' '}
                {item.breakdown.filter(b => b.match).length} matches
              </Text>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>📊</Text>
      <Text style={styles.emptyTitle}>No quiz history yet</Text>
      <Text style={styles.emptySubtitle}>
        Complete your first sync quiz to see your history here!
      </Text>
    </View>
  );

  return (
    <ScreenWrapper padded={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quiz History</Text>
        <View style={styles.placeholder} />
      </View>

      <Text style={styles.subtitle}>
        View your shared discoveries and how well you sync over time
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.roomId}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyState}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    marginBottom: Spacing.sm,
  },
  backButton: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  placeholder: {width: 50},
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  historyCard: {
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glass,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textAccent,
  },
  date: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '20',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.primary,
  },
  scoreInfo: {
    flex: 1,
  },
  compatLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  questionCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
  },
  emptyEmoji: {fontSize: 48, marginBottom: Spacing.base},
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
});
