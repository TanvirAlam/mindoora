import { memo } from "react";
import { SwiperSlide } from "swiper/react";
import CarouselCard from "./CarouselItem/CarouselCard";
import { type CarouselType } from "~/types/type";
import { urlForThumbnail } from "~/utils/cms/imageProcess";
import type { CarouselPropsType } from "~/types/type";
import { CarouselSetup } from "./CarouselSetup";

const MemorizedCarouselSetup = memo(CarouselSetup);

export const CarouselColor = ({
  carouselList,
  isTextColor,
}: CarouselPropsType) => {
  return (
    <MemorizedCarouselSetup>
      {carouselList.map((item: CarouselType, index: number) => (
        <SwiperSlide key={index}>
          <CarouselCard
            isTextColor={isTextColor}
            cardImageColor={
              item.CarousalAnimation !== undefined
                ? urlForThumbnail(item.CarousalAnimation)
                : urlForThumbnail(item.cardImageColor)
            }
            isContentColor={false}
          />
        </SwiperSlide>
      ))}
    </MemorizedCarouselSetup>
  );
};
