import { atom } from "recoil";
import type { Notification } from "~/types/type";

export const notificationsRecoilState = atom<Notification[]>({
  key: "Notifications",
  default: [],
});
