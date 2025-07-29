import Image from "next/image";
import { useState } from "react";

const Players = () => {
  const [players] = useState([
    {
      id: 1,
      image: "/assets/avater1.svg",
      name: "player 1 Name",
    },
    {
      id: 2,
      image: "/assets/avater2.svg",
      name: "player 2 Name",
    },
  ]);

  return (
    <div className="flex-row-center mt-2 ">
      {players.map((player) => (
        <div key={player.id} className="relative h-6 w-6">
          <Image
            fill
            src={player.image}
            alt={player.name}
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
};

export default Players;
