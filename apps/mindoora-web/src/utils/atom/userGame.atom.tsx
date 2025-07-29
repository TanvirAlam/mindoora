import { atom } from "recoil";
import { Game } from "~/types/type";

export const userGameRecoilState = atom<Game[]>({
  key: "userGameState",
  default: [],
});

export const userGamePublicRecoilState = atom<Game[]>({
  key: "userGamePublicState",
  default: [],
});
