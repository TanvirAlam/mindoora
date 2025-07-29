import { atom } from "recoil";

export const gameTypeRecoilState = atom({
  key: "questionTypeId",
  default: "mul",
});
