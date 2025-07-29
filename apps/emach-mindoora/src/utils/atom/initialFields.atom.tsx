import { atom } from "recoil";

export const intialState = [
  {
    index: 0,
    id: "Q1",
    value: "",
    ans: false,
  },
];

export const initialStateTF = [
  {
    index: 0,
    id: "True",
    img: "/assets/true.png",
    value: "True"
  },
  {
    index: 1,
    id: "False",
    img: "/assets/false.png",
    value: "False",
  },
];

export const initialStateNoAns = [
  {
    index: 0,
    id: "Q1no",
    img: "/assets/dont-know.png",
    value: true,
    ans: true,
  },
];

export const initialFieldsRecoilState = atom({
  key: "initialFields",
  default: intialState,
});

export const initialFieldsRecoilStateTF = atom({
  key: "initialFieldsTF",
  default: initialStateTF,
});

export const initialFieldsRecoilStateNoAns = atom({
  key: "initialFieldsNoAns",
  default: initialStateNoAns,
});
