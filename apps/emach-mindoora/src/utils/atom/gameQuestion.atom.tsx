import { atom } from "recoil";
import type { QuestionListType } from "../../types/type";

export const questionRecoilState = atom({
  key: "createQuestionRecoilState",
  default: [] as QuestionListType[],
});
