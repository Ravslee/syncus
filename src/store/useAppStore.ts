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
  partner: null,
  setPartner: (partner: User | null) => set({partner}),
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
      partner: null,
      partnerStatus: null,
      results: null,
    }),

  resetAll: () =>
    set({
      user: null,
      isOnboarded: false,
      room: null,
      roomCode: '',
      partner: null,
      currentQuestionIndex: 0,
      questions: [],
      answers: {},
      partnerStatus: null,
      results: null,
      history: [],
    }),
}));
