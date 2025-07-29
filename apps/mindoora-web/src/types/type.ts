import { type Session } from "next-auth/core/types";
import { type JWT } from "next-auth/jwt";

export type Todo = {
  id: string;
  todo: string;
};

export type State = {
  todo: string;
  todosData: Todo[];
  todoId: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  userType: string;
  accessToken: string;
  image: string;
  registerId: string;
  password: string;
  error: string;
  verified: boolean;
};

export type RegisterFormData = {
  name: string;
  email: string;
  password: string;
  recaptcha: string;
  // policy: boolean;
};

export type SessionCallbackParams = {
  session: {
    user: User;
  };
  token: JWT & {
    id: string;
    email: string;
    name: string;
    userType: string;
    image: string;
    accessToken: string;
    error: string;
  };
};
export type JWTCallbackParams = {
  token: JWT & {
    // Add any additional properties present in your token object
  };
  user: User;
  profile?: object; // Adjust the type of the profile object if necessary
  trigger?: "signIn" | "signUp" | "update" | undefined;
  isNewUser?: boolean;
  session?: Session;
};

export type CarouselType = {
  videoSrc(videoSrc: any): void;
  gameName: string;
  gameDescription: string;
  cardImageWhite: string;
  cardImageColor: string;
  CarousalAnimation?: string;
};

export type CarouselPropsType = {
  carouselList: CarouselType[];
  isTextColor: boolean;
};

export type Step1FormType = {
  gameName: string;
  language: string;
  players: string;
  selectedCategories: string[];
};

export type saveGameConfigureType = {
  title: string;
  language: string;
  nPlayer: string;
  imgUrl: string;
  description: string;
  isPublic: boolean;
  category: string;
  keyWords: string[];
};

export type backNextButtonType = {
  activeStep: number;
  stepsLength: number;
  handleBack: () => void;
  handleNext?: () => void;
  submitting: boolean;
};

export type QuestionListType = {
  question: string;
  questionId: number;
  answer: string;
  options: object;
  qSource: string;
  qImage?: File;
  qPoints?: number;
  qTrophy?: string;
};

export type CardType = {
  id: number;
  name: string;
  imageSrc: string;
  isChecked: boolean;
};

export interface Questions {
  id: string;
  gameId: string;
  cardName: string;
  question: string;
  answer?: number | null;
  options?: Record<string, string>;
  createdAt: Date;
}

export enum gameRole {
  admin = "admin",
  moderator = "moderator",
  guest = "guest",
}

export interface Notification {
  from: string;
  notification: string;
  name: string;
}

export interface Players {
  id: string;
  roomId: string;
  name: string;
  imgUrl?: string | null;
  role: gameRole;
  isApproved: boolean;
  createdAt: Date;
}

export interface GameResult {
  playerName: string;
  nQuestionSolved: number;
  rightAnswered: number;
  points: number;
  image?: string
}

export interface GameRoom{
  id: string;
  status: string
}

export interface GameRoomQuestions{
  id: string;
  gameId: string;
  question: string;
  answer?: number;
  options?: [];
  createdAt: Date;
  isAnswered: boolean;
  answered: number | null;
  answeredBy: string[] | [];
}

export interface GamePlay {
  gameId: string;
  playerId: string;
  roomId: string;
  name: string;
  refresh?: boolean;
  showResult: boolean;
  qNumber: number | 0;
  isAdminPlaying?: boolean
}

export interface Messages {
  id: string;
  text: string;
  name: string;
  type: string;
  roomId: string;
  createdAt: Date;
}

export interface Game {
  id: string;
  title: string;
  language: string;
  nPlayer: number;
  user: string | null;
  createdAt: string;
  imgUrl: string;
  author: string;
  averageStars: number;
  nReviews: number;
  nRoomsCreated: number;
  nQuestions: number;
  category: string;
}
