// ============================================================
// SyncUs - Quiz Screen
// ============================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { QuestionCard } from '../components/QuestionCard';
import { PartnerStatusOverlay } from '../components/PartnerStatusOverlay';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { RootStackParamList, UserRoomStatus } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useQuiz } from '../hooks/useQuiz';
import { usePartnerStatus } from '../hooks/usePartnerStatus';
import { fetchQuestions } from '../services/quizService';
import { CATEGORIES } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
  route: RouteProp<RootStackParamList, 'Quiz'>;
};

export const QuizScreen: React.FC<Props> = ({ navigation, route }) => {
  const { roomId, categoryId } = route.params;
  const { user, room, partner, setQuestions, questions } = useAppStore();
  const partnerName = partner?.displayName ? partner.displayName.split(' ')[0] : 'they';
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Phase 2 State
  const [partnerAnswers, setPartnerAnswers] = useState<Record<string, number>>({});
  const [fetchingPartner, setFetchingPartner] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const {
    quizPhase,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    isLastQuestion,
    progress,
    handleAnswer,
    handleGuess,
    handleNext,
  } = useQuiz(roomId, categoryId);

  const { partnerStatus } = usePartnerStatus(roomId);

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

  const isWaitState = quizPhase === 1 && currentQuestionIndex >= totalQuestions;

  // Phase transition logic
  useEffect(() => {
    if (isWaitState && !fetchingPartner && totalQuestions > 0) {
      const partnerReady =
        partnerStatus?.status === UserRoomStatus.WAITING_FOR_PARTNER ||
        partnerStatus?.status === UserRoomStatus.GUESSING ||
        partnerStatus?.status === UserRoomStatus.COMPLETED;

      if (partnerReady) {
        setFetchingPartner(true);
        const fetchRemoteAnswers = async () => {
          try {
            const { fetchUserAnswers } = await import('../services/quizService');
            const partnerId = room?.users.find(id => id !== user?.uid);
            if (partnerId) {
              const answersMap = await fetchUserAnswers(roomId, partnerId, categoryId);
              const map: Record<string, number> = {};
              answersMap.forEach(a => (map[a.questionId] = a.selectedOption));
              setPartnerAnswers(map);

              // Reset index and enter Phase 2
              useAppStore.setState({ quizPhase: 2, currentQuestionIndex: 0 });
              setSelectedOption(null);
            }
          } catch (e) {
            console.error('Failed to fetch partner answers', e);
          } finally {
            setFetchingPartner(false);
          }
        };
        fetchRemoteAnswers();
      }
    }
  }, [isWaitState, partnerStatus, fetchingPartner, totalQuestions, room, user, roomId]);

  // Navigate to results when Phase 2 completes
  useEffect(() => {
    if (
      quizPhase === 2 &&
      currentQuestionIndex >= totalQuestions &&
      totalQuestions > 0 &&
      !loading
    ) {
      navigation.replace('Result', { roomId });
    }
  }, [currentQuestionIndex, totalQuestions, loading, roomId, navigation, quizPhase]);

  const onOptionSelect = async (optionIndex: number) => {
    if (showNext) return; // Locked until next question
    setSelectedOption(optionIndex);
    setSubmitting(true);
    try {
      if (quizPhase === 1) {
        await handleAnswer(optionIndex);
        setSelectedOption(null);
      } else {
        await handleGuess(optionIndex);
        setShowNext(true); // show manual next button
      }
    } catch (error) {
      console.error('Failed to submit answer/guess:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const onNextClicked = async () => {
    setSelectedOption(null);
    setShowNext(false);
    await handleNext();
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

  // Intermediate waiting screen between phases
  if (isWaitState) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <Text style={{ fontSize: 56, marginBottom: Spacing.xl }}>⏳</Text>
          <Text style={styles.waitingTitle}>You're fast!</Text>
          <Text style={styles.loadingText}>
            Waiting for {partnerName} to finish Phase 1...
          </Text>
          <GlassCard style={{ marginTop: Spacing.xl, padding: Spacing.lg }}>
            <Text style={{ color: Colors.textSecondary, textAlign: 'center' }}>
              Once they're done, the real game begins. You will have to guess what
              they answered!
            </Text>
          </GlassCard>
        </View>
      </ScreenWrapper>
    );
  }

  if (!currentQuestion) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  const actAnswer = quizPhase === 2 ? partnerAnswers[currentQuestion.id] : null;

  return (
    <ScreenWrapper scrollable padded={false} style={{ backgroundColor: Colors.surfaceAccent }}>
      <View style={styles.container}>

        <View style={{ backgroundColor: Colors.surfaceDark, flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: Colors.surfaceAccent, borderBottomLeftRadius: 64, }}>
            {/* Header */}
            <View style={[styles.header, { justifyContent: 'flex-start' }]}>
              <View style={styles.progressContainer}>
                {
                  [...Array(totalQuestions)].map((_, index) => (
                    <View key={index} style={[styles.progressBar]}>
                      {index < currentQuestionIndex + 1 && <View
                        style={[
                          styles.progressFill,

                          quizPhase === 2 && { backgroundColor: Colors.surfaceAccent },
                        ]}
                      />}
                    </View>
                  ))
                }
              </View>

              {/* <View style={styles.categoryBadge}>
                <Text style={styles.categoryEmoji}>{category?.icon}</Text>
                <Text style={[styles.categoryName, { opacity: 1 }]}>
                  {quizPhase === 1 ? category?.name : category?.name + ' | Guess Your Partner'}
                </Text>
              </View> */}

              {/* Progress Bar */}
              {/* <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progress * 100}%` },
                      quizPhase === 2 && { backgroundColor: Colors.secondary },
                    ]}
                  />
                </View>

              </View> */}


            </View>

            {/* Partner Status */}
            {quizPhase === 1 && (
              <PartnerStatusOverlay
                partnerStatus={partnerStatus}
                totalQuestions={totalQuestions}
              />
            )}

            {quizPhase === 2 && (
              <Text
                style={{
                  // paddingVertical: Spacing.base,
                  paddingHorizontal: Spacing.base,
                  color: Colors.textMuted,
                  marginBottom: Spacing.md,
                  fontFamily: Typography.fontFamily.extrabold,
                }}>
                What did {partnerName.toUpperCase()} choose?
              </Text>
            )}



            {/* Question */}
            <View style={styles.questionSection}>
              <Text style={styles.progressText}>
                {currentQuestionIndex + 1} / {totalQuestions}
              </Text>
              <Text style={styles.questionText}>{currentQuestion.text}</Text>
            </View>
          </View>
        </View>





        <View style={{
          flex: 1 / 2,
          paddingHorizontal: Spacing.base,
          paddingVertical: Spacing.base,
          // borderTopLeftRadius: 10,
          borderTopRightRadius: 64,
          backgroundColor: Colors.surfaceDark,
          // backgroundColor: 'red'

        }}>
          {/* Options */}
          <View style={styles.options}>
            {currentQuestion.options.map((option, index) => {
              const isCurrentlySelected = selectedOption === index;
              // Phase 2 validation calculations
              let isCorrect = false;
              let isWrong = false;

              if (quizPhase === 2 && showNext) {
                const partnerChose = actAnswer === index;
                if (isCurrentlySelected && partnerChose) {
                  isCorrect = true;
                } else if (isCurrentlySelected && !partnerChose) {
                  isWrong = true;
                } else if (partnerChose) {
                  isCorrect = true; // highlight actual answer green even if they didn't pick it
                }
              }

              return (
                <QuestionCard
                  key={index}
                  option={option}
                  index={index}
                  selected={isCurrentlySelected}
                  isCorrect={isCorrect}
                  isWrong={isWrong}
                  onPress={submitting || showNext ? () => { } : onOptionSelect}
                />
              );
            })}
          </View>

          {quizPhase === 2 && (
            <GradientButton
              style={{ marginTop: Spacing.base, marginHorizontal: Spacing.base }}
              title={isLastQuestion ? 'Finish Game' : 'Next Question'}
              onPress={onNextClicked}
              disabled={!showNext}
            />
          )}

        </View>



      </View>

    </ScreenWrapper >
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Spacing.base,
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  waitingTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.textPrimary,
    fontFamily: Typography.fontFamily.displayBold,
    marginBottom: Spacing.sm,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.base,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
  },
  header: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.xl,
    fontFamily: Typography.fontFamily.bold,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: Spacing.base,
    // backgroundColor: Colors.white,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    // position: 'absolute',
    // top: 0,
    // right: 0,
    // borderRadius: BorderRadius.full,
    // borderWidth: 1,
    // borderColor: Colors.glassBorder,

    // marginBottom: Spacing.base,
    // marginRight: Spacing.base,
    fontFamily: Typography.fontFamily.bold,
  },
  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryName: {
    fontSize: Typography.fontSize.md,
    color: Colors.textMuted,
    // opacity: 0.1,
    // textTransform: 'uppercase',
    fontFamily: Typography.fontFamily.extrabold,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    fontFamily: Typography.fontFamily.bold,
  },
  progressBar: {
    flex: 1,
    height: 6,
    // flexDirection: 'column',
    backgroundColor: Colors.surfaceDark,
    borderRadius: 3,
    overflow: 'hidden',
    fontFamily: Typography.fontFamily.bold,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    opacity: 0.6,
    borderRadius: 3,
    fontFamily: Typography.fontFamily.bold,
  },
  progressText: {
    fontSize: Typography.fontSize['xl'],
    color: Colors.textMuted,
    minWidth: 40,
    textAlign: 'left',
    fontFamily: Typography.fontFamily.bold,
  },
  questionSection: {
    // paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.base,
    // marginTop: Spacing['2xl'],
    // marginBottom: Spacing['2xl'],
    fontFamily: Typography.fontFamily.bold,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surfaceAccent,
    // borderBottomLeftRadius: 64,
    // borderBottomRightRadius: 50,
  },
  questionText: {
    fontSize: Typography.fontSize['3xl'],
    color: Colors.textMuted,
    // lineHeight: 32,
    fontFamily: Typography.fontFamily.displayExtrabold,
  },
  options: {
    gap: 0,
    // flex: 1,
    paddingTop: Spacing['2xl'],
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    // paddingBottom: Spacing['3xl'],

    // backgroundColor: Colors.surface,
  },
});
