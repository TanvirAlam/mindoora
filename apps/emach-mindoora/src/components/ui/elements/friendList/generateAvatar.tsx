import { Styled } from "./GenerateAvatar.styled";

const generateAvatar = ({
  playerName,
  ratio,
  plyerPoint,
  roomStatusLive,
}: {
  playerName: string;
  ratio: number;
  plyerPoint: number;
  roomStatusLive: boolean | string;
}) => {
  return (
    <Styled.Avatar>
      <Styled.AvatarImg
        src={"/assets/head-test.png"}
        className="border-radius"
        alt={playerName}
      />
      <Styled.LiveMarker>
        <text className="bg-[#4d297b] p-2 font-semibold tracking-wider">{`${playerName}`}</text>
        {roomStatusLive && <span>{`${plyerPoint}`}</span>}
      </Styled.LiveMarker>
    </Styled.Avatar>
  );
};

export default generateAvatar;
