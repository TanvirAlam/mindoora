"use client";

import { useEffect, useRef, useState } from "react";
import Avatar from "react-avatar";
import type { GamePlay, Messages } from "~/types/type";

function ChatBody({
  gamePlay,
  messages,
  socket,
}: {
  gamePlay: GamePlay;
  messages: Messages[];
  socket: any;
}) {
  const [typing, setTyping] = useState<string>("");
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    socket?.on("typing_response", (data) => {
      setTyping(data);
    });
  }, []);

  return (
    <div className="flex w-full basis-[85%] flex-col gap-2 overflow-y-scroll p-5">
      {messages?.map((message: Messages, index: number) =>
        message.type === "top" ? (
          <div className="flex self-center" key={index}>
            <div className="flex items-center justify-center">
              <p>{message.text}</p>
            </div>
          </div>
        ) : message.name === gamePlay.name ? (
          <div className="flex self-end" key={index}>
            <div className="bg-primary flex items-center justify-center rounded-full rounded-br-none bg-slate-300 px-3 py-1 text-black">
              <p className="font-sans">{message.text}</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 self-start" key={index}>
            <div className="self-center">
              <Avatar
                name={message.name}
                round={true}
                size="30"
                className="text-sm"
              />
            </div>
            <div>
              <p className="pl-2 align-bottom text-sm">{message.name}</p>
              <div className="flex items-center justify-center rounded-full rounded-tl-none bg-gray-200 px-3 py-1 text-black">
                <p className="font-sans">{message.text}</p>
              </div>
              <p className="py-2 pl-2 text-xs font-light">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        )
      )}
      <div ref={lastMessageRef} className="mt-auto text-slate-500">
        {typing}
      </div>
    </div>
  );
}

export default ChatBody;
