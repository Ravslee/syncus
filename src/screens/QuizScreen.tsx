// ============================================================
// SyncUs - Quiz Screen
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  BackHandler,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { QuestionCard } from '../components/QuestionCard';
import { PartnerStatusOverlay } from '../components/PartnerStatusOverlay';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/theme';
import { RootStackParamList, UserRoomStatus, RoomStatus } from '../types';
import { useAppStore } from '../store/useAppStore';
import { useQuiz } from '../hooks/useQuiz';
import { useRoomPresence } from '../hooks/useRoomPresence';
import { useRoom } from '../hooks/useRoom';
import { fetchQuestions } from '../services/quizService';
import { updateHeartbeat } from '../services/roomService';
import { CATEGORIES } from '../constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Quiz'>;
  route: RouteProp<RootStackParamList, 'Quiz'>;
};

export const QuizScreen: React.FC<Props> = ({ navigation, route }) => {
  const { roomId, categoryId } = route.params;
  const { user, room, partner, setQuestions, questions, resetQuiz } = useAppStore();
  useRoom(roomId); // Keep room data fresh via real-time listener
  const partnerName = partner?.displayName ? partner.displayName.split(' ')[0] : 'they';
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Phase 2 State
  const [partnerAnswers, setPartnerAnswers] = useState<Record<string, number>>({});
  const [fetchingPartner, setFetchingPartner] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [readyToGuess, setReadyToGuess] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [waitTimeout, setWaitTimeout] = useState(false);

  // Animation values
  const { width } = Dimensions.get('window');
  const questionAnim = React.useRef(new Animated.Value(width)).current;
  const optionsAnim = React.useRef(new Animated.Value(-width)).current;

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
    syncAllAnswers,
  } = useQuiz(roomId, categoryId);

  const { partnerStatus } = useRoomPresence(roomId);

  const category = CATEGORIES.find(c => c.id === categoryId);

  // Back button confirmation
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert(
          'Quit Quiz?',
          'Are you sure you want to leave? Your progress in this round will be lost.',
          [
            { text: 'Stay', style: 'cancel' },
            {
              text: 'Quit',
              style: 'destructive',
              onPress: async () => {
                try {
                  // Reset room state back to JOINED so partner sees us as idle
                  if (user && room) {
                    const { updateProgress } = await import('../services/quizService');
                    await updateProgress(room.id, user.uid, 0, UserRoomStatus.JOINED);
                  }
                } catch (e) {
                  console.error('Failed to reset room state:', e);
                }
                resetQuiz();
                navigation.navigate('Home');
              },
            },
          ],
        );
        return true; // prevent default back
      };

      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [user, room, resetQuiz, navigation])
  );

  // #3: Detect partner leaving room mid-quiz
  useEffect(() => {
    if (!room || !user) return;

    const partnerLeft =
      room.status === RoomStatus.COMPLETED ||
      (room.users.length < 2 && room.users.length > 0 && !room.users.includes(user.uid) === false);

    if (partnerLeft) {
      Alert.alert(
        'Partner Left',
        'Your partner has left the room. The quiz has ended.',
        [
          {
            text: 'OK',
            onPress: () => {
              resetQuiz();
              navigation.navigate('Home');
            },
          },
        ],
        { cancelable: false },
      );
    }
  }, [room?.status, room?.users.length]);

  // #1: Heartbeat (update our lastActive every 30s)
  useEffect(() => {
    if (!user || !room) return;

    // Initial heartbeat
    updateHeartbeat(room.id, user.uid);

    const interval = setInterval(() => {
      updateHeartbeat(room.id, user.uid);
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.uid, room?.id]);

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

  // #5 & #1: Timeout & Stale detection on waiting-for-partner screen
  useEffect(() => {
    if (!isWaitState || readyToGuess || fetchError) {
      setWaitTimeout(false);
      return;
    }

    // Check if partner is stale (not seen in > 60s)
    const checkStale = () => {
      if (partnerStatus?.lastActive) {
        const diff = Date.now() - partnerStatus.lastActive;
        if (diff > 60000) {
          setWaitTimeout(true);
        }
      }
    };

    const staleInterval = setInterval(checkStale, 10000);
    const timeoutTimer = setTimeout(() => setWaitTimeout(true), 2 * 60 * 1000);

    return () => {
      clearInterval(staleInterval);
      clearTimeout(timeoutTimer);
    };
  }, [isWaitState, readyToGuess, fetchError, partnerStatus?.lastActive]);

  // Phase transition logic
  useEffect(() => {
    if (isWaitState && !fetchingPartner && totalQuestions > 0 && !readyToGuess && !fetchError) {
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

              // Set ready to guess instead of transitioning immediately
              setReadyToGuess(true);
            }
          } catch (e) {
            console.error('Failed to fetch partner answers', e);
            setFetchError(true);
          } finally {
            setFetchingPartner(false);
          }
        };
        fetchRemoteAnswers();
      }
    }
  }, [isWaitState, partnerStatus, fetchingPartner, totalQuestions, room, user, roomId, readyToGuess, fetchError]);

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

  useEffect(() => {
    questionAnim.setValue(width);
    optionsAnim.setValue(-width);

    Animated.parallel([
      Animated.timing(questionAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(optionsAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentQuestionIndex, width, questionAnim, optionsAnim]);

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
        setShowNext(true); // lock state to show correct/wrong
        setTimeout(() => {
          onNextClicked();
        }, 500);
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
    if (readyToGuess) {
      return (
        <ScreenWrapper>
          <View style={styles.loadingContainer}>
            <Text style={{ fontSize: 56, marginBottom: Spacing.xl }}>🤩</Text>
            <Text style={styles.waitingTitle}>Ready to guess?</Text>
            <Text style={styles.loadingText}>
              Both of you have finished answering! It's time to see how well you know each other.
            </Text>
            <View style={{ marginTop: Spacing['3xl'], width: '100%' }}>
              <GradientButton
                title="Start Guessing"
                onPress={() => {
                  useAppStore.setState({ quizPhase: 2, currentQuestionIndex: 0 });
                  setSelectedOption(null);
                  setReadyToGuess(false);
                }}
              />
            </View>
          </View>
        </ScreenWrapper>
      );
    }

    if (fetchError) {
      return (
        <ScreenWrapper>
          <View style={styles.loadingContainer}>
            <Text style={{ fontSize: 56, marginBottom: Spacing.xl }}>⚠️</Text>
            <Text style={styles.waitingTitle}>Sync Failed</Text>
            <Text style={styles.loadingText}>
              We had trouble syncing with {partnerName}. Please check your connection and try again.
            </Text>
            <View style={{ marginTop: Spacing['3xl'], width: '100%' }}>
              <GradientButton
                title="Retry Sync"
                onPress={() => setFetchError(false)}
              />
            </View>
          </View>
        </ScreenWrapper>
      );
    }

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

          <TouchableOpacity
            onPress={syncAllAnswers}
            style={{ marginTop: Spacing.lg, padding: Spacing.sm }}
          >
            <Text style={{ color: Colors.primaryLight, fontSize: Typography.fontSize.xs, textDecorationLine: 'underline' }}>
              Not syncing? Tap to refresh your status
            </Text>
          </TouchableOpacity>

          {waitTimeout && (
            <View style={{ marginTop: Spacing.xl, width: '100%', alignItems: 'center' }}>
              <Text style={[styles.loadingText, { color: Colors.textMuted, marginBottom: Spacing.md }]}>
                Taking too long? Your partner may have disconnected.
              </Text>
              <GradientButton
                title="Go Home"
                variant="secondary"
                onPress={async () => {
                  try {
                    if (user && room) {
                      const { updateProgress } = await import('../services/quizService');
                      await updateProgress(room.id, user.uid, 0, UserRoomStatus.JOINED);
                    }
                  } catch (e) {
                    console.error('Failed to reset room state:', e);
                  }
                  resetQuiz();
                  navigation.navigate('Home');
                }}
                style={{ width: '100%' }}
              />
            </View>
          )}
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
            <Animated.View style={[styles.questionSection, { transform: [{ translateX: questionAnim }] }]}>
              <Text style={styles.progressText}>
                {currentQuestionIndex + 1} / {totalQuestions}
              </Text>
              <Text style={styles.questionText}>{currentQuestion.text}</Text>
            </Animated.View>
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
          <Animated.View style={[styles.options, { transform: [{ translateX: optionsAnim }] }]}>
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
          </Animated.View>



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
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
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
