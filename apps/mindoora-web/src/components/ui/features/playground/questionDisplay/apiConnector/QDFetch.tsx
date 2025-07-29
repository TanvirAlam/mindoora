import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";

 export const handleSaveGameExperience = async ({
  roomId,
  totalQ,
  timeTaken,
  totalText,
}: {
  roomId: string;
  totalQ: number;
  timeTaken: number;
  totalText: number;
}) => {
  const api = await apiSetup();
  api
    .post(endPoints.gameExperience.save, {
      roomId,
      totalQ,
      timeTaken,
      totalText,
    })
    .catch((error: any) => {
      console.log(error);
    });
};
