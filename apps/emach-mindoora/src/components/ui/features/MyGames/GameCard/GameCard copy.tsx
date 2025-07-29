import { Styled } from "./GameCard.styled";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
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
import { CustomLoader } from "~/ui/components/elements/GenericSpinner";
import { useState } from "react";
import { gamePlayRecoilState } from "~/utils/atom/gamePlay.atom";
import { gamePlayersRecoilState } from "~/utils/atom/gameRoom.atom";
import { postMethod } from "~/utils/api/postMethod";
import { fredoka } from "~/components/ui/elements/fonts/mindooraFonts";
import { GameSpecification } from "./GameSpecification";
import { monthNames } from "~/utils/globalMixins/mixins";
import { GameDetails } from "./GameDetails";

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
        setModalState({
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

  return (
    <Styled.GameCard>
      <Styled.ImgBox>
        <Image
          src={game.imgUrl || "/assets/game1.png"}
          alt="game image"
          width={100}
          height={100}
        />
        {game.nQuestions === 0 ? (
          <Image
            src={"/assets/no-play.png"}
            alt="no play image"
            width={20}
            height={20}
          />
        ) : (
          ""
        )}
      </Styled.ImgBox>
      <Styled.GameCardContent>
        <Styled.GameDetails>
          <Styled.GameName className={fredoka.className}>
            {game.title}
          </Styled.GameName>
          <Styled.DetailData>
            <div className="game-features">
              <GameSpecification
                title="Max Players"
                image="/assets/no-players.png"
                value={game.nPlayer}
              />
              <GameSpecification
                title="Total Questions"
                image="/assets/questions.png"
                value={game.nQuestions}
              />
              <GameSpecification
                title="Total Played"
                image="/assets/games-played.svg"
                value={game.nRoomsCreated}
              />
              <GameSpecification
                title="Language"
                image="/assets/language.png"
                value={game.language}
              />
              <GameSpecification
                title="Created At"
                image="/assets/created-at.png"
                value={monthNames[new Date(game.createdAt).getMonth()]}
              />
              <GameSpecification
                title="Author"
                image="/assets/auther.png"
                value={game.author}
              />
              <GameSpecification
                title="Star Ratings"
                image="/assets/stars.png"
                value={game.averageStars}
              />
            </div>
          </Styled.DetailData>
          <Styled.GameActions>
            <div className="flex gap-2">
              <CustomLoader isLoading={isLoading} />
              {game.nQuestions !== 0 ? (
                <>
                  <GenericButton
                    backgroundcolor="rgba(11, 16, 62, 1)"
                    textcolor="#fff"
                    variant="shadow"
                    activebgcolor="#FF6F50"
                    isdisabled={false}
                    shape="20px"
                    shadowcolor="#888"
                    size="medium"
                    onClick={(e: any) => {
                      e.preventDefault();
                      handlePlayClick({ gameId: game.id as string });
                    }}
                  >
                    Play
                  </GenericButton>
                  <GenericButton
                    backgroundcolor="#5968f5"
                    textcolor="#fff"
                    variant="shadow"
                    activebgcolor="#FF6F50"
                    isdisabled={false}
                    shape="20px"
                    shadowcolor="#888"
                    size="medium"
                    onClick={(e: any) => {
                      e.preventDefault();
                      handleDetailsClick({ gameId: game.id as string });
                    }}
                  >
                    Details
                  </GenericButton>
                </>
              ) : (
                ""
              )}

              {deletePower && (
                <GenericButton
                  backgroundcolor="#e30000"
                  textcolor="#fff"
                  variant="shadow"
                  activebgcolor="#e30000"
                  isdisabled={false}
                  shape="20px"
                  shadowcolor="#888"
                  size="medium"
                  onClick={(e: any) => {
                    e.preventDefault();
                    handleDeleteClick({ gameId: game.id as string });
                  }}
                >
                  Delete
                </GenericButton>
              )}
            </div>
            <div className="flex gap-2">
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
          </Styled.GameActions>
        </Styled.GameDetails>
      </Styled.GameCardContent>
    </Styled.GameCard>
  );
};
