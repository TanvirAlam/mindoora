import Image from "next/image";

type Chat = {
  name: string;
  image: string;
  isActive: boolean;
  lastMessage: string;
  lastSeenTime: string;
};

type Props = {
  chats: Chat[];
};

export const Chats = ({ chats }: Props) => {
  return (
    <div className="mt-4 flex flex-col justify-center">
      {chats.map((chat, index) => (
        <div className="flex-row-center p-2" key={index}>
          <div className="relative mr-2 h-12 w-12">
            <Image
              src={chat.image}
              alt={chat.name}
              fill
              className="object-contain"
            />
            {chat.isActive && (
              <div className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-green-500"></div>
            )}
          </div>

          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <h3 className="mr-2">{chat.name}</h3>
              <p className="text-sm text-slate-300">{chat.lastSeenTime}</p>
            </div>
            <p className="text-sm text-slate-300">{chat.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
