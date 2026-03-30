// ============================================================
// SyncUs - TypeScript Type Definitions
// ============================================================

// --- Enums ---

export enum RoomStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export enum UserRoomStatus {
  JOINED = 'joined',
  ANSWERING = 'answering',
  COMPLETED = 'completed',
}

// --- Core Models ---

export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt?: number;
  lastLoginAt?: number;
  photoURL?: string;
}

export interface Room {
  id: string;
  code: string;
  users: string[];
  status: RoomStatus;
  categoryId: string;
  createdAt: number;
}

export interface RoomState {
  roomId: string;
  userId: string;
  status: UserRoomStatus;
  currentQuestionIndex: number;
  completedAt: number | null;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: [string, string];
}

export interface Question {
  id: string;
  categoryId: string;
  text: string;
  options: string[];
  order: number;
}

export interface Answer {
  roomId: string;
  userId: string;
  questionId: string;
  selectedOption: number;
  createdAt: number;
}

export interface QuestionBreakdown {
  questionId: string;
  questionText: string;
  user1Answer: number;
  user2Answer: number;
  match: boolean;
}

export interface Result {
  roomId: string;
  score: number;
  totalQuestions: number;
  breakdown: QuestionBreakdown[];
  calculatedAt: number;
  users: string[];
  categoryId: string;
  createdAt: number;
}

// --- Navigation Types ---

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Onboarding: undefined;
  Home: undefined;
  CreateRoom: undefined;
  JoinRoom: undefined;
  WaitingRoom: { roomId: string; roomCode: string };
  CategorySelection: { roomId: string };
  Quiz: { roomId: string; categoryId: string };
  Result: { roomId: string };
  Summary: { roomId: string };
  History: undefined;
};

// --- Store Types ---

export interface AppState {
  // User
  user: User | null;
  isOnboarded: boolean;
  setUser: (user: User | null) => void;
  setOnboarded: (value: boolean) => void;

  // Room
  room: Room | null;
  roomCode: string;
  setRoom: (room: Room | null) => void;
  setRoomCode: (code: string) => void;
  clearRoom: () => void;

  // Quiz
  currentQuestionIndex: number;
  questions: Question[];
  answers: Record<string, number>;
  setQuestions: (q: Question[]) => void;
  setAnswer: (questionId: string, option: number) => void;
  nextQuestion: () => void;

  // Partner
  partnerStatus: RoomState | null;
  setPartnerStatus: (status: RoomState | null) => void;

  // Results
  results: Result | null;
  setResults: (r: Result | null) => void;

  // History
  history: Result[];
  setHistory: (h: Result[]) => void;

  // Reset
  resetQuiz: () => void;
  resetAll: () => void;
}
