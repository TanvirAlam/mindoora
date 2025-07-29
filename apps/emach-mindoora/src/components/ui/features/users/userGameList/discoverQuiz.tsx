import Image from "next/image";
import { Styled } from "../userHero/hero.styled";
import useCarousel from "~/utils/cms/carousel/useCarousel";
import { urlForThumbnail } from "~/utils/cms/imageProcess";
import Rating from "./rating";
import { UserWrapper } from "../comWrapper";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/router";

export const DiscoverQuiz = () => {
  const { carouselList } = useCarousel();
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <UserWrapper
      title={"Discover Quiz"}
      child={
        <div className="mt-4 flex flex-row items-center justify-between gap-2">
          {carouselList.slice(0, 5).map((game) => (
            <div
              key={game.gameName}
              className="group relative h-72 min-w-[15rem] rounded-2xl"
            >
              <Image
                src={urlForThumbnail(game?.cardImageColor)}
                fill
                className="rounded-2xl object-cover"
                alt={game.gameName}
              />
              <Styled.GlasmorphismCard className="hidden cursor-pointer delay-500 group-hover:inline">
                <div className="flex-col-center">
                  <h1 className="text-lg font-semibold"> {game.gameName}</h1>
                  <p>4.2k Players</p>
                  <Rating rating={4.5} />
                  <GenericButton
                    variant="shadow"
                    backgroundcolor="DodgerBlue"
                    shadowcolor="gray"
                    onClick={() => {
                      router.push("/game");
                    }}
                    textcolor={""}
                  >
                    {t("Join Game")}
                  </GenericButton>
                </div>
              </Styled.GlasmorphismCard>
            </div>
          ))}
        </div>
      }
    ></UserWrapper>
  );
};
