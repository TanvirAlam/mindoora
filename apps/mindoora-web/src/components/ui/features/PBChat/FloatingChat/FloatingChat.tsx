import { useState, useEffect } from "react";
import { Styled } from "./FloatingChat.styled";
import ChatBody from "~/components/ui/features/PBChat/Chat/ChatBody";
import ChatFooter from "~/components/ui/features/PBChat/Chat/ChatFooter";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { messagesRecoilState } from "~/utils/atom/gameRoom.atom";
import { useSocket } from "~/utils/contexts/SocketContext";
import Image from "next/image";
import { gamePlayRecoilState } from "~/utils/atom/gamePlay.atom";
import { uuidv4 } from "~/ui/components/utils/uuid";

export const FloatingChat = () => {
  const [toggleChat, setToggleChat] = useState(false);

  const [gamePlay] = useRecoilState(gamePlayRecoilState);
  const [messages] = useRecoilState(messagesRecoilState);
  const { socket } = useSocket();

  return (
    <Styled.Floater
      onClick={() => (!toggleChat ? setToggleChat(true) : null)}
      chatToggle={toggleChat}
    >
      <Styled.ChatIcon size={35} chatToggle={toggleChat} />
      <Styled.Chat chatToggle={toggleChat}>
        <Styled.ChatHeader>
          <Styled.Title>
            <Image
              src="/assets/mindoora-short.png"
              width="20"
              height="20"
              alt=""
            />
            <p>CHAT</p>
          </Styled.Title>
          <Styled.CrossButton>
            <Styled.CloseChat size={35} onClick={() => setToggleChat(false)} />
          </Styled.CrossButton>
        </Styled.ChatHeader>
        <ChatBody gamePlay={gamePlay} messages={messages} socket={socket} />
        <ChatFooter gamePlay={gamePlay} socket={socket} />
      </Styled.Chat>
    </Styled.Floater>
  );
};
