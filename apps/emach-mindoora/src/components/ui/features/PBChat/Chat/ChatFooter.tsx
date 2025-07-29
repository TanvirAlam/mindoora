"use client";

import { useRef, useState } from "react";
import { AiFillPlusCircle, AiFillLike } from "react-icons/ai";
import { BsImage } from "react-icons/bs";
import { IoMdSend } from "react-icons/io";
import { GrEmoji } from "react-icons/gr";
import Picker from "emoji-picker-react";
import { GamePlay } from "~/types/type";
import { uuidv4 } from "~/ui/components/utils/uuid";

function ChatFooter({ gamePlay, socket }: { gamePlay: GamePlay; socket: any }) {
  const [message, setMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);
  const inputRef = useRef<any | null>(null);

  const onEmojiPick = (emojiObj: any) => {
    setMessage((prevInput) => prevInput + emojiObj.emoji);
    inputRef.current.focus();
    setShowEmojiPicker(false);
  };


  const handleSendMessage = (e: any, message: string) => {
    e.preventDefault();
    if (message.trim()) {
      socket?.emit("send_message", {
        id: uuidv4(),
        text: message,
        name: gamePlay.name,
        type: "normal",
        roomId: gamePlay.roomId,
        createdAt: new Date()
      });
    }
    setMessage("");
  };

  const handleTyping = () => {
    const typingMessage = message ? `${gamePlay.name} is typing...` : "";
    socket?.emit("typing", {typingMessage, roomId: gamePlay.roomId});
  };

  return (
    <div className="flex basis-[8%] items-center gap-4 border-t-2 p-2">

        <>
          <AiFillPlusCircle size={20} className="text-primary cursor-pointer" />
          <BsImage size={20} className="text-primary cursor-pointer" />
        </>

      <div className="relative w-full ">
        <div className="absolute -right-8 bottom-12 sm:right-0 ">
          {showEmojiPicker && (
            <Picker
              onEmojiClick={onEmojiPick}
              previewConfig={{ showPreview: false }}
            />
          )}
        </div>
        <GrEmoji
          size={20}
          className="text-primary absolute right-2 top-[6px] cursor-pointer"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        />

        <form onSubmit={(e) => handleSendMessage(e, message)}>
          <input
            ref={inputRef}
            type="text"
            value={message}
            className="h-8 rounded-full bg-gray-100 p-2 transition-all focus:outline-none"
            placeholder="Aa"
            onKeyUp={handleTyping}
            onChange={(e) => {
              setMessage(e.target.value), setShowEmojiPicker(false);
            }}
          />
        </form>
      </div>
      {message.length === 0 ? (
        <AiFillLike
          size={28}
          className="text-primary cursor-pointer"
          onClick={(e) => handleSendMessage(e, "👍")}
        />
      ) : (
        <IoMdSend
          size={28}
          className="text-primary cursor-pointer"
          onClick={(e) => handleSendMessage(e, message)}
        />
      )}
    </div>
  );
}

export default ChatFooter;
