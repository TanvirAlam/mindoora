import useCarousel from "~/utils/cms/carousel/useCarousel";
import Image from "next/image";
import { urlForThumbnail } from "~/utils/cms/imageProcess";
import Players from "./players";
import Points from "./points";

interface GameListsProps {
  loadVideo: (videoSrc: string) => void;
}

const GameLists = ({ loadVideo }: GameListsProps) => {
  const { carouselList } = useCarousel();

  const handleClick = (videoSrc) => {
    loadVideo(videoSrc);
  };
  console.log(carouselList);

  return (
    <div className="mb-2 h-[380px] min-w-[18rem] overflow-y-auto p-4">
      {carouselList.map((item) => (
        <div
          key={item.gameName}
          className="flex-row-center mb-4 h-28 w-full cursor-pointer rounded-2xl bg-[#272358] hover:bg-sky-700"
          onClick={() => handleClick(urlForThumbnail(item.cardImageColor))}
        >
          <div className="relative m-4 h-20 w-1/3 rounded-2xl">
            <Image
              fill
              src={urlForThumbnail(item.cardImageColor)}
              alt={item.gameName}
              sizes="100vw"
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex h-full w-2/3 flex-col items-start justify-center ">
            <h1 className="text-sm font-bold uppercase">{item.gameName}</h1>
            <Points />
            <Players />
          </div>
        </div>
      ))}
    </div>
  );
};

export default GameLists;
