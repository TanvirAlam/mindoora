import { useState, useEffect } from "react";
import GenerateAvatar from "./generateAvatar";
import { Styled } from "./friendList.styled";
import { useRecoilState } from "recoil";
import { gameResultRecoilState } from "~/utils/atom/gameRoom.atom";
import type { GameResult } from "~/types/type";

interface FriendListProps {
  players: string[];
  roomStatusLive?: boolean | string;
  pointUpdate?: boolean;
  extraPoints?: number;
}

const FriendList = ({
  players,
  roomStatusLive,
  pointUpdate,
  extraPoints = 0,
}: FriendListProps) => {
  const [gameResult] = useRecoilState(gameResultRecoilState);
  const [result, setResult] = useState<GameResult[]>([]);

  useEffect(() => {
    pointUpdate && setResult(gameResult);
  }, [pointUpdate]);

  const getPoint = (playerName: string) => {
    const playerResult = result.find((p) => p.playerName === playerName);
    const playerPoints = playerResult?.points || 0;
    return playerPoints + extraPoints; // Add extraPoints to player's points
  };

  return (
    <div className="flex items-center overflow-hidden pl-[5rem]">
      <Styled.AutoGrid live={roomStatusLive}>
        {players.map((p, index) => (
          <GenerateAvatar
            key={index}
            playerName={p}
            plyerPoint={getPoint(p)}
            ratio={0}
            roomStatusLive={roomStatusLive}
          />
        ))}
      </Styled.AutoGrid>
    </div>
  );
};
export default FriendList;
