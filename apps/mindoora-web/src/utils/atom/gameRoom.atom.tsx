import { atom } from "recoil";
import type { Players, GameRoom, GameRoomQuestions, Messages, GameResult } from "~/types/type";

export const gamePlayersRecoilState = atom<Players[]>({
  key: "gamePlayers",
  default: [],
});

export const gameRoomStatusRecoilState = atom<GameRoom[]>({
  key: "gameRoomStatus",
  default: [],
});

export const gameRoomQuestionsRecoilState = atom<GameRoomQuestions[]>({
  key: "gameRoomQuestions",
  default: [],
});

export const messagesRecoilState = atom<Messages[]>({
  key: "messages",
  default: [],
});

export const gameResultRecoilState = atom<GameResult[]>({
  key: "gameResult",
  default: [],
});
