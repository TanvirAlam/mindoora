import { useState, useEffect } from "react";
import { AiModalWrapper } from "~/styles/mixins.styled";
import { useRecoilState } from "recoil";
import { endPoints } from "~/utils/api/route";
import { apiSetup } from "~/utils/api/api";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { Styled } from "./GameDetails.styled";
import { Categories } from "../../../createGames/category.data";
import { fredoka } from "~/components/ui/elements/fonts/mindooraFonts";
import Image from "next/image";
import { GameSpecification } from "../GameSpecification";
import { QuestionViews } from "../../../createGames/AddQuestions/QuestionOverviews/QuestionViews";
import FollowButton from "~/components/ui/elements/FollowButton/Follow";
import { useSession } from "next-auth/react";

export const GameDetails = ({ gameId }: any) => {
  const [game, setGame] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [, setIsLoading] = useRecoilState(loadingRecoilState);
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const fetch = async () => {
    setTimeout(async () => {
      try {
        const api = await apiSetup();
        const response = await api.get(
          `${endPoints.userGameOpen.one}?id=${gameId}`
        );
        if (response.status === 201) {
          setGame(response.data.result);
        }
      } catch (error: any) {
        console.log(error);
      }
      setIsLoading(false);
      fetchQuestions();
    }, 0);
  };

  const fetchQuestions = async () => {
    try {
      const api = await apiSetup();
      const response = await api.get(
        //Naming is worng, we need ot fix this
        `${endPoints.userGame.allofgame}?id=${gameId}`
      );
      if (response.status === 200) {
        console.log(response.data.result);
        setQuestions(response.data.result.questions);
      }
    } catch (error: any) {
      console.log(error);
    }
    setIsLoading(false);
  };

  const fetchIsFollowing = async () => {
    try {
      const api = await apiSetup();
      const response = await api.get(
        `${endPoints.follow.isFollowing}?followingId=${game?.registerId}`
      );
      if (response.status === 201) {
        setIsFollowing(response.data.result.isFollowing);
      }
    } catch (error: any) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetch();
    fetchIsFollowing();
  }, []);

  const findCategoryByLabel = (label) => {
    return Categories.find((category) => category.Label === label);
  };

  return (
    <AiModalWrapper className={fredoka.className}>
      <div className="h-hull absolute flex flex-col items-center justify-between">
        <Image
          src="/assets/mindoora.png"
          alt="game"
          width={300}
          height={500}
          className="blur-sm"
        />
        <Image
          src="/assets/footer-image.png"
          alt="game"
          width={700}
          height={500}
          className="blur-sm"
        />
      </div>
      <div className="z-50 flex w-full flex-col items-center justify-start text-[#7d59a5]">
        <Styled.GameName>{game?.title}</Styled.GameName>
        <div className="flex w-full justify-between gap-4 p-4">
          <GameSpecification
            title="Max Players"
            image="/assets/max-players.svg"
            value={game?.nPlayer}
          />
          <GameSpecification
            title="Total Questions"
            image="/assets/questions.svg"
            value={game?.nQuestions}
          />
          <GameSpecification
            title="Total Played"
            image="/assets/games-played.svg"
            value={game?.nRoomsCreated}
          />
          <GameSpecification
            title="Language"
            image="/assets/language.svg"
            value={game?.language}
          />
        </div>
        <Styled.GameAuther>
          <GameSpecification
            title="Author"
            image="/assets/auther.svg"
            value={game?.name}
          />
          { game && userId !== game?.userId &&
          <FollowButton isFollowing={isFollowing} followingId={game?.registerId} fallBackFunction={fetchIsFollowing} />}
        </Styled.GameAuther>
        <Styled.Line />
        <Styled.GameDescription>
          <label className="rounded-lg bg-[#7C59A8] p-2 text-white">
            Question Details
          </label>
          <p>{game?.description}</p>
        </Styled.GameDescription>
        <Styled.QuestionWrapper>
          <div className="flex items-center justify-start gap-2 p-2">
            <Image
              src="/assets/questions.svg"
              alt="question"
              width={30}
              height={50}
            />
            <label className="rounded-lg bg-[#7C59A8] p-2 text-white">
              {game?.nQuestions} Questions
            </label>
          </div>
          <Styled.GameQuestions>
            <QuestionViews questions={questions} />
          </Styled.GameQuestions>
        </Styled.QuestionWrapper>
      </div>
    </AiModalWrapper>
  );
};
