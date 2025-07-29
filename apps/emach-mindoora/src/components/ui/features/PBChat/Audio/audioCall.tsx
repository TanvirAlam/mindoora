"use client";

import { useEffect, useState } from "react";
import { LiveKitRoom } from "@livekit/components-react";
import "@livekit/components-styles";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import { AudioConference } from "./audioConference";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { gamePlayRecoilState } from "~/utils/atom/gamePlay.atom";

export const AudioCall = () => {
  const [gamePlay] = useRecoilState(gamePlayRecoilState);
  const [token, setToken] = useState("");
  const roomId = gamePlay.roomId;
  const name = gamePlay.name;

  const { data: session } = useSession();

  useEffect(() => {
    const FetchToken = async () => {
      const api = await apiSetup();
      try {
        const response = await api.get(
          `${endPoints.livekit.get}?room=${roomId}&username=${name}`
        );
        if (response.status === 201) {
          setToken(response.data.token);
          toast.success(response.data.message);
        }
      } catch (error: any) {
        toast.error(error.response.data.message);
      }
    };
    {
      roomId !== "" && name !== "" && FetchToken();
    }
  }, [gamePlay]);

  const getAvater = () => {
    const Avater = session?.user?.image;
    return Avater === "mindooraAvater"
      ? `/assets/${session?.user?.image}.png`
      : session?.user?.image;
  };

  if (token === "") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading...</p>
      </div>
    );
  }

  return (
    <LiveKitRoom
      data-lk-theme="default"
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={false}
      audio={true}
      style={{ height: "10vh" }}
    >
      {/* <ControlBar/> */}

      <AudioConference chatId={roomId} />
    </LiveKitRoom>
  );
};
