// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'facebook';
  trophies: Trophy[];
  totalScore: number;
}

// Game Types
export interface Game {
  id: string;
  code: string;
  hostId: string;
  players: Player[];
  questions: Question[];
  currentQuestionIndex: number;
  status: 'waiting' | 'playing' | 'finished';
  settings: GameSettings;
  createdAt: Date;
}

export interface Player {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  answers: Answer[];
  isHost: boolean;
  isReady: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  genre: QuestionGenre;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
}

export interface Answer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  timeSpent: number;
  pointsEarned: number;
}

export interface GameSettings {
  maxPlayers: number;
  questionCount: number;
  timePerQuestion: number;
  genres: QuestionGenre[];
  difficulty: 'mixed' | 'easy' | 'medium' | 'hard';
}

// Trophy and Achievement Types
export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  category: 'score' | 'streak' | 'participation' | 'genre';
}

// Question Categories
export type QuestionGenre = 
  | 'history'
  | 'science'
  | 'geography'
  | 'entertainment'
  | 'sports'
  | 'literature'
  | 'movies'
  | 'music'
  | 'general-knowledge'
  | 'pop-culture';

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Game: { gameId: string };
  GameLobby: { gameId: string };
  JoinGame: undefined;
  CreateGame: undefined;
  Profile: undefined;
  Settings: undefined;
};

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Game Events (for real-time communication)
export interface GameEvent {
  type: 'player-joined' | 'player-left' | 'game-started' | 'question-answered' | 'game-ended';
  gameId: string;
  playerId?: string;
  data?: any;
  timestamp: Date;
}
