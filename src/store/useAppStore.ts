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
  clearRoom: () => set({room: null, roomCode: ''}),

  // ---- Quiz ----
  currentQuestionIndex: 0,
  questions: [],
  answers: {},
  setQuestions: (questions: Question[]) => set({questions}),
  setAnswer: (questionId: string, option: number) =>
    set(state => ({
      answers: {...state.answers, [questionId]: option},
    })),
  nextQuestion: () =>
    set(state => ({
      currentQuestionIndex: state.currentQuestionIndex + 1,
    })),

  // ---- Partner ----
  partnerStatus: null,
  setPartnerStatus: (status: RoomState | null) =>
    set({partnerStatus: status}),

  // ---- Results ----
  results: null,
  setResults: (results: Result | null) => set({results}),

  // ---- History ----
  history: [],
  setHistory: (history: Result[]) => set({history}),

  // ---- Reset ----
  resetQuiz: () =>
    set({
      currentQuestionIndex: 0,
      questions: [],
      answers: {},
      partnerStatus: null,
      results: null,
    }),

  resetAll: () =>
    set({
      user: null,
      isOnboarded: false,
      room: null,
      roomCode: '',
      currentQuestionIndex: 0,
      questions: [],
      answers: {},
      partnerStatus: null,
      results: null,
      history: [],
    }),
}));
