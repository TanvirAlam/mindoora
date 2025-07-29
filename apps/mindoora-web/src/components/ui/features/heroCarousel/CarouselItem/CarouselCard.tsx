import Image from "next/image";
import CardDescription from "./CardDescription";

type CarouselCardType = {
  cardImageColor: string;
  isTextColor: boolean;
  isContentColor?: boolean;
  gameName?: string;
};

const CarouselCard = ({
  cardImageColor,
  isTextColor,
  isContentColor,
  gameName,
}: CarouselCardType) => {
  return (
    <div className="relative h-[20rem] w-[14.75rem] overflow-hidden rounded-lg">
      <Image
        fill
        src={cardImageColor}
        className="object-cover"
        alt="card"
        sizes="20"
      />

      {isContentColor && (
        <CardDescription isTextColor={isTextColor} gameName={gameName} />
      )}
    </div>
  );
};

export default CarouselCard;
