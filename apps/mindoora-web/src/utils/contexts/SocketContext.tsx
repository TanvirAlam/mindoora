"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { gameResultRecoilState, messagesRecoilState } from "../atom/gameRoom.atom";
import { gamePlayersRecoilState, gameRoomStatusRecoilState } from "../atom/gameRoom.atom";
import { useRecoilState } from "recoil";
import { io as ClientIO } from "socket.io-client";
import type { GameResult, Messages } from "~/types/type";
import { gamePlayRecoilState } from "../atom/gamePlay.atom";
import { uuidv4 } from "~/ui/components/utils/uuid";
import { gameRoomQuestionsRecoilState } from "../atom/gameRoom.atom";
import { notificationsRecoilState } from "../atom/notifications.atom";

type SocketContextType = {
  socket: any | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState(null);
  const [, setMessages] = useRecoilState(messagesRecoilState);
  const [, serGamePlayers] = useRecoilState(gamePlayersRecoilState);
  const [gameRoomStatus, setGameRoomStatus] = useRecoilState(gameRoomStatusRecoilState);
  const [gamePlay, ] = useRecoilState(gamePlayRecoilState);
  const [, setGameResult] = useRecoilState(gameResultRecoilState);
  const [questions, setQuestions] = useRecoilState(
    gameRoomQuestionsRecoilState
  );
  const [, setNotifications] = useRecoilState(notificationsRecoilState);

  let socketInstance: any;


  useEffect(() => {
    socketInstance = new (ClientIO as any)(
      process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_SOCKET_URL_PRODUCTION : process.env.NEXT_PUBLIC_SOCKET_URL_LOCAL
    );

    setSocket(socketInstance);

    socketInstance.on("receive_message", (data : Messages) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    socketInstance.on("players_response", (data: any) => {
      serGamePlayers(data);
    });

    socketInstance.on("result_response", (data: GameResult[]) => {
      setGameResult(data);
    });

    socketInstance.on("new_game_notification", (data: any) => {
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    });

    socketInstance.on("q_solve_response", (data) => {
      setQuestions((prevQuestions) => {
        return prevQuestions.map((q) => {
          if (q.id === data.questionId) {
            return {
              ...q,
              answeredBy: data.playerId,
            };
          }
          return q;
        });
      });
    });

    socketInstance.on("game_status", (data: any) => {
      const newData = gameRoomStatus.filter((g)=> g.id !== data.id);
      setGameRoomStatus([...newData, data]);
  });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (gamePlay.roomId !== "") {
      socket?.emit("join_room", {roomId: gamePlay.roomId, playerId: gamePlay.playerId});
      gamePlay.name !== "" && socket?.emit("send_message", {
        id: uuidv4(),
        text: gamePlay.name + " joined the room.",
        name: gamePlay.name,
        type: "top",
        roomId: gamePlay.roomId,
        createdAt: new Date(),
      });
    }
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      handleUnload();
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [gamePlay, socket]);

  const handleUnload = () => {
    if (gamePlay.roomId) {
      socket?.emit("send_message", {
        id: uuidv4(),
        text: gamePlay.name + " left the room.",
        name: gamePlay.name,
        type: "top",
        roomId: gamePlay.roomId,
        createdAt: new Date(),
      });
    }
  };


  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
