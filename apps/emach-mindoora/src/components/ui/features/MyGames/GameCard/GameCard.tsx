import { Styled } from "./GameCard.styled";
import {
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import { useRecoilState } from "recoil";
import { gameIdRecoilState } from "~/utils/atom/gameId.atom";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import ConfirmModal from "~/components/ui/elements/confirm/confirm";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Game } from "~/types/type";
import Code from "../../friendInvitation/codeInvitation/code";
import { useState } from "react";
import { gamePlayRecoilState } from "~/utils/atom/gamePlay.atom";
import { gamePlayersRecoilState } from "~/utils/atom/gameRoom.atom";
import { postMethod } from "~/utils/api/postMethod";
import { fredoka } from "~/components/ui/elements/fonts/mindooraFonts";
import { GameSpecification } from "./GameSpecification";
import { GameDetails } from "./GameDetails";
import { FaQuestionCircle } from "react-icons/fa";
import { PlayButtonStyled } from "~/ui/components/elements/CreateButton/CreateButtonStyled";
import { MdDelete } from "react-icons/md";
import Link from "next/link";
import { FaLink } from "react-icons/fa";
import { GameUserDetails } from "./GameDetails/GameUserDetails";
import { isSoloPlayRecoilState } from "~/utils/atom/isSoloPlay.atom";
import { useRouter } from "next/router";

export const GameCard = ({
  game,
  fetch,
}: {
  game: Game;
  fetch: () => void;
}) => {
  const session = useSession();
  const deletePower = session?.data?.user?.userType === game.user;
  const [, setGameIdState] = useRecoilState(gameIdRecoilState);
  const [, setModalState] = useRecoilState(modalRecoilState);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [gameId] = useRecoilState(gameIdRecoilState);
  const [, setGamePlay] = useRecoilState(gamePlayRecoilState);
  const [, setGamePlayers] = useRecoilState(gamePlayersRecoilState);
  const [isSoloPlay] = useRecoilState(isSoloPlayRecoilState);
  const router = useRouter();

  const deleteData = async ({ gameId }: { gameId: string }) => {
    const api = await apiSetup();
    try {
      const response = await api.delete(
        `${endPoints.userGame.delete}?id=${gameId}`
      );
      if (response.status === 204) {
        fetch();
        setModalState({
          open: false,
          modalComponent: <></>,
        });
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleClick = async (gameId: string) => {
    setGamePlayers([]);
    try {
      const response = await postMethod(`${endPoints.gameRoom.create}`, {
        gameId,
      });
      if (response.status === 201) {
        setInviteCode(response.data.inviteCode);
        setGamePlay((prevData) => {
          return { ...prevData, roomId: response.data.roomId };
        });
        setGamePlayers(response.data.allPlayers);
        isSoloPlay
          ? router.push(
              `/game/${response.data.inviteCode}/${session.data?.user?.name}`
            )
          : setModalState({
              open: true,
              modalComponent: <Code inviteCode={response.data.inviteCode} />,
            });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handlePlayClick = async ({ gameId }: { gameId: string }) => {
    setIsLoading(true);
    setGameIdState(gameId);
    handleClick(gameId);
  };

  const handleDetailsClick = async ({ gameId }: { gameId: string }) => {
    setModalState({
      open: true,
      modalComponent: <GameDetails gameId={gameId} />,
    });
  };

  const handleDeleteClick = async ({ gameId }: { gameId: string }) => {
    setGameIdState(gameId);
    setModalState({
      open: true,
      modalComponent: (
        <ConfirmModal
          message="Are you sure you want to do this?"
          onConfirm={() => deleteData({ gameId })}
        />
      ),
    });
  };

  const handleGameUserDetails = async ({
    gameUserId,
  }: {
    gameUserId: string;
  }) => {
    setModalState({
      open: true,
      modalComponent: <GameUserDetails gameUserId={gameUserId} />,
    });
  };

  return (
    <Styled.GameCard className={fredoka.className}>
      <div className="relative flex items-start justify-start gap-4 p-4 text-[#4d297b]">
        <div className="relative flex flex-col items-center justify-center">
          {game.nQuestions === 0 && game.imgUrl == "null" ? (
            <Image
              src={"/assets/no-play.png"}
              alt="no play image"
              width={20}
              height={20}
            />
          ) : (
            <Image
              src={game.imgUrl !== null ? game.imgUrl : "/assets/game2.png"}
              alt="game image"
              width={150}
              height={100}
              className="rounded-3xl p-2"
            />
          )}
          <span className="absolute left-0 top-12 ml-2 flex w-[50px] items-center justify-center gap-2 rounded-xl bg-[#7c5aa8] p-1 font-bold text-white">
            <FaQuestionCircle />
            <span>{game.nQuestions}</span>
          </span>
          <div className="relative flex gap-2">
            <TwitterShareButton
              url={"https://www.example.com"}
              quote={"Dummy text!"}
              hashtag="#muo"
            >
              <TwitterIcon size={20} round />
            </TwitterShareButton>
            <LinkedinShareButton
              url={"https://www.example.com"}
              quote={"Dummy text!"}
              hashtag="#muo"
            >
              <LinkedinIcon size={20} round />
            </LinkedinShareButton>
            <WhatsappShareButton
              url={"https://www.example.com"}
              quote={"Dummy text!"}
              hashtag="#muo"
            >
              <WhatsappIcon size={20} round />
            </WhatsappShareButton>
          </div>
        </div>
        <div className="relative flex flex-col">
          <Styled.GameName className={fredoka.className}>
            <Link
              href="#"
              className="flex gap-2 text-[#4d297b]"
              onClick={(e: any) => {
                e.preventDefault();
                handleDetailsClick({ gameId: game.id as string });
              }}
            >
              <FaLink />
              {game.title}
            </Link>
            {deletePower && (
              <MdDelete
                className="cursor-pointer hover:text-[#F64216]"
                size={20}
                onClick={(e: any) => {
                  e.preventDefault();
                  handleDeleteClick({ gameId: game.id as string });
                }}
              />
            )}
          </Styled.GameName>
          <div className="flex justify-between">
            <GameSpecification
              title="Max Players"
              image="/assets/max-players.svg"
              value={game.nPlayer}
            />
            <GameSpecification
              title="Total Questions"
              image="/assets/questions.svg"
              value={game.nQuestions}
            />
            <GameSpecification
              title="Total Played"
              image="/assets/games-played.svg"
              value={game.nRoomsCreated}
            />
            <GameSpecification
              title="Language"
              image="/assets/language.svg"
              value={game.language}
            />
          </div>
          <div className="pt-4">
            <Link
              href={"#"}
              onClick={(e: any) => {
                e.preventDefault();
                handleGameUserDetails({ gameUserId: game.user as string });
              }}
            >
              <GameSpecification
                title="Author"
                image="/assets/auther.svg"
                value={game.author}
              />
            </Link>
          </div>
          <div className="flex items-center justify-center pt-2">
            {game.nQuestions !== 0 ? (
              <div className="flex w-full items-center justify-between gap-4">
                <PlayButtonStyled
                  onClick={(e: any) => {
                    e.preventDefault();
                    handlePlayClick({ gameId: game.id as string });
                  }}
                >
                  <div className="flex items-center justify-center gap-2 font-bold text-white">
                    <Image
                      src={"/assets/create-game.png"}
                      alt=""
                      width="20"
                      height="20"
                    />
                    <span className={fredoka.className}>
                      {isSoloPlay ? "Alone" : "Team"}
                    </span>
                  </div>
                </PlayButtonStyled>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </Styled.GameCard>
  );
};
