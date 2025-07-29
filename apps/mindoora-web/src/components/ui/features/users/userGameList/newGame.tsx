import Image from "next/image";
import { Styled } from "../userHero/hero.styled";
import useCarousel from "~/utils/cms/carousel/useCarousel";
import { urlForThumbnail } from "~/utils/cms/imageProcess";
import ScrollContainer from "react-indiana-drag-scroll";

const NewGame = () => {
  const { carouselList } = useCarousel();
  return (
    <div className="text-white">
      <h1 className="mt-4 text-2xl font-bold">New game</h1>
      <ScrollContainer hideScrollbars={false}>
        <div className="mt-4 flex h-72 flex-row items-center justify-between gap-2">
          {carouselList.slice(4, 8).map((game) => (
            <div
              key={game.gameName}
              className="relative h-full min-w-[10rem] rounded-2xl"
            >
              <Image
                src={urlForThumbnail(game?.cardImageColor)}
                fill
                className="rounded-2xl object-cover"
                alt={game.gameName}
              />
              <Styled.GlasmorphismCard>
                <div className="flex flex-col justify-center p-4">
                  <h1 className="font-semibold"> {game.gameName}</h1>
                  <p>actions</p>
                  <div className="absolute -top-[30%] right-4">
                    <div className="relative h-16 w-16 ">
                      <Image
                        fill
                        src="/assets/playButton.svg"
                        alt="Play Button"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </Styled.GlasmorphismCard>
            </div>
          ))}
        </div>
      </ScrollContainer>
    </div>
  );
};

export default NewGame;
