import Image from "next/image";
import PlayNow from "../playNow";
import { useCallback } from "react";

type Props = {
  players: { name: string; image: File | null; id: string }[];
  handleDelete: (id: string) => void;
};
const Players = ({ players, handleDelete }: Props) => {
  const handleClick = useCallback(
    (id: string) => {
      handleDelete(id);
    },
    [handleDelete]
  );

  return (
    <div className="flex flex-col justify-center gap-4">
      <h1 className="text-lg font-medium text-white"> Players</h1>
      <div className="flex max-w-md flex-wrap items-center justify-around gap-4 rounded-2xl bg-[#120D57] p-4 text-white">
        {players.map((player) => (
          <div
            key={player.id}
            className="boder-[#d9d9d9] flex flex-row items-center justify-between gap-4 rounded-2xl  border p-4"
          >
            <div className="flex-row-center gap-1">
              <Image
                src={
                  player.image
                    ? URL.createObjectURL(player.image)
                    : "/assets/userAvater1"
                }
                alt="Uploaded Image"
                width={64}
                height={64}
              />
              <p>{player.name}</p>
            </div>
            <Image
              src="/crossIcon.svg"
              alt="Cross Icon"
              width={24}
              height={24}
              onClick={(e: any) => {
                e.preventDefault();
                handleClick(player.id);
              }}
            />
          </div>
        ))}
      </div>
      <PlayNow />
    </div>
  );
};

export default Players;
