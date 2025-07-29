import Image from "next/image";
import { Styled } from "../userHero/hero.styled";
import useCarousel from "~/utils/cms/carousel/useCarousel";
import { urlForThumbnail } from "~/utils/cms/imageProcess";
import { UserWrapper } from "../comWrapper";

const TopQuiz = () => {
  const { carouselList } = useCarousel();

  return (
    <UserWrapper
      title={"Top Quiz"}
      child={
        <div className="mt-4 flex flex-row items-center justify-between gap-2">
          {carouselList.slice(0, 5).map((game) => (
            <div
              key={game.gameName}
              className="relative h-72 min-w-[15rem] rounded-2xl"
            >
              <Image
                src={urlForThumbnail(game?.cardImageColor)}
                fill
                className="rounded-2xl object-cover"
                alt={game.gameName}
              />
              <Styled.GlasmorphismCard>
                <div className="flex-col-center">
                  <h1 className="font-semibold">{game.gameName}</h1>
                  <p>4.2k Players</p>
                </div>
              </Styled.GlasmorphismCard>
            </div>
          ))}
        </div>
      }
    ></UserWrapper>
  );
};

export default TopQuiz;
