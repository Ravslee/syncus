// ============================================================
// SyncUs - Quiz Screen
// ============================================================

import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import {ScreenWrapper} from '../components/ScreenWrapper';
import {QuestionCard} from '../components/QuestionCard';
import {PartnerStatusOverlay} from '../components/PartnerStatusOverlay';
import {GradientButton} from '../components/GradientButton';
import {Colors, Typography, Spacing, BorderRadius} from '../constants/theme';
import {RootStackParamList, UserRoomStatus} from '../types';
import {useAppStore} from '../store/useAppStore';
import {useQuiz} from '../hooks/useQuiz';
import {usePartnerStatus} from '../hooks/usePartnerStatus';
import {fetchQuestions} from '../services/quizService';
import {CATEGORIES} from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
  route: RouteProp<RootStackParamList, 'Quiz'>;
};

export const QuizScreen: React.FC<Props> = ({navigation, route}) => {
  const {roomId, categoryId} = route.params;
  const {setQuestions, questions} = useAppStore();
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    isLastQuestion,
    progress,
    handleAnswer,
  } = useQuiz(roomId);

  const {partnerStatus} = usePartnerStatus(roomId);

  const category = CATEGORIES.find(c => c.id === categoryId);

  // Load questions
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const qs = await fetchQuestions(categoryId);
        setQuestions(qs);
      } catch (error) {
        console.error('Failed to load questions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [categoryId, setQuestions]);

  // Navigate to results when user completes
  useEffect(() => {
    if (
      currentQuestionIndex >= totalQuestions &&
      totalQuestions > 0 &&
      !loading
    ) {
      navigation.replace('Result', {roomId});
    }
  }, [currentQuestionIndex, totalQuestions, loading, roomId, navigation]);

  const onOptionSelect = async (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setSubmitting(true);
    try {
      await handleAnswer(optionIndex);
      setSelectedOption(null);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (!currentQuestion) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Finishing up...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryEmoji}>{category?.icon}</Text>
            <Text style={styles.categoryName}>{category?.name}</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, {width: `${progress * 100}%`}]}
              />
            </View>
            <Text style={styles.progressText}>
              {currentQuestionIndex + 1} / {totalQuestions}
            </Text>
          </View>
        </View>

        {/* Partner Status */}
        <PartnerStatusOverlay
          partnerStatus={partnerStatus}
          totalQuestions={totalQuestions}
        />

        {/* Question */}
        <View style={styles.questionSection}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {currentQuestion.options.map((option, index) => (
            <QuestionCard
              key={index}
              option={option}
              index={index}
              selected={selectedOption === index}
              onPress={submitting ? () => {} : onOptionSelect}
            />
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.base,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '600',
    color: Colors.textAccent,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  questionSection: {
    marginTop: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  questionText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: '700',
    color: Colors.white,
    lineHeight: 32,
  },
  options: {
    gap: 0,
  },
});
