import { atom } from "recoil";
import type { GamePlay } from "~/types/type";

export const gamePlayDefaultValue = {
  gameId: "",
  playerId: "",
  roomId: "",
  name: "",
  refresh: false,
  showResult: false,
  qNumber: 0,
  isAdminPlaying: true,
};

export const gamePlayRecoilState = atom<GamePlay>({
  key: "gamePlayState",
  default: gamePlayDefaultValue,
});
