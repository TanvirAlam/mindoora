import Image from "next/image";
import StarIcon from "@mui/icons-material/Star";
import useCarousel from "~/utils/cms/carousel/useCarousel";
import { urlForThumbnail } from "~/utils/cms/imageProcess";
import ScrollContainer from "react-indiana-drag-scroll";

const OnGoingGames = () => {
  const { carouselList } = useCarousel();
  return (
    <div className="h-full w-full text-white">
      <h1 className="text-2xl font-bold">On going game</h1>
      <ScrollContainer hideScrollbars={false}>
        <div className="mt-4 flex flex-row gap-2">
          {carouselList.slice(8, 11).map((game) => (
            <div
              key={game.gameName}
              className="h-60 min-w-[10rem]  overflow-hidden rounded-2xl bg-[#383671]"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={urlForThumbnail(game?.cardImageColor)}
                  fill
                  className="object-cover"
                  alt={game.gameName}
                />
              </div>
              <div className="flex items-center justify-around p-2">
                <div>
                  <h1 className="ml-1 font-semibold">{game.gameName}</h1>
                  <button className="rounded-full bg-[#151053] px-2 py-1">
                    Playful
                  </button>
                </div>
                <div className="flex-row-center">
                  <span className="mr-1"> 3.5</span>
                  <StarIcon fontSize="small" className="text-amber-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollContainer>
    </div>
  );
};
export default OnGoingGames;
