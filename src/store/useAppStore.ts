// ============================================================
// SyncUs - Zustand Store
// ============================================================

import {create} from 'zustand';
import {AppState, User, Room, Question, RoomState, Result} from '../types';

export const useAppStore = create<AppState>((set, get) => ({
  // ---- User ----
  user: null,
  isOnboarded: false,
  setUser: (user: User | null) => set({user}),
  setOnboarded: (value: boolean) => set({isOnboarded: value}),

  // ---- Room ----
  room: null,
  roomCode: '',
  setRoom: (room: Room | null) => set({room}),
  setRoomCode: (code: string) => set({roomCode: code}),
  clearRoom: () => set({room: null, roomCode: '', partner: null}),
  leaveRoom: async (roomId: string, userId: string) => {
    try {
      const {leaveRoom: leaveRoomService} = await import('../services/roomService');
      await leaveRoomService(roomId, userId);
      get().clearRoom();
    } catch (e) {
      console.error('Failed to leave room:', e);
    }
  },

  // ---- Quiz ----
  quizPhase: 1,
  currentQuestionIndex: 0,
  questions: [],
  answers: {},
  guesses: {},
  setQuizPhase: (phase: 1 | 2) => set({quizPhase: phase}),
  setQuestions: (questions: Question[]) => set({questions}),
  setAnswer: (questionId: string, option: number) =>
    set(state => ({
      answers: {...state.answers, [questionId]: option},
    })),
  setGuess: (questionId: string, option: number) =>
    set(state => ({
      guesses: {...state.guesses, [questionId]: option},
    })),
  nextQuestion: () =>
    set(state => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),

  // ---- Partner ----
  partner: null,
  setPartner: (partner: User | null) => set({partner}),
  partnerStatus: null,
  setPartnerStatus: (status: RoomState | null) =>
    set({partnerStatus: status}),
  myStatus: null,
  setMyStatus: (status: RoomState | null) =>
    set({myStatus: status}),

  // ---- Results ----
  results: null,
  setResults: (results: Result | null) => set({results}),

  // ---- History ----
  history: [],
  setHistory: (history: Result[]) => set({history}),

  // ---- Reset ----
  resetQuiz: () =>
    set({
      quizPhase: 1,
      currentQuestionIndex: 0,
      questions: [],
      answers: {},
      guesses: {},
      partner: null,
      results: null,
    }),

  resetAll: () =>
    set({
      user: null,
      isOnboarded: false,
      room: null,
      roomCode: '',
      partner: null,
      quizPhase: 1,
      currentQuestionIndex: 0,
      questions: [],
      answers: {},
      guesses: {},
      partnerStatus: null,
      myStatus: null,
      results: null,
      history: [],
    }),
}));
