import { memo } from "react";
import dynamic from "next/dynamic";
import { SwiperSlide } from "swiper/react";
import CarouselCard from "./CarouselItem/CarouselCard";

const CarouselSetup = dynamic(() => import("./CarouselSetup"));
const MemorizedCarouselSetup = memo(CarouselSetup);

export const Carousel = () => {
  return (
    <MemorizedCarouselSetup>
      {[...Array(20)].map((_, index) => (
        <SwiperSlide key={index}>
          <CarouselCard />
        </SwiperSlide>
      ))}
    </MemorizedCarouselSetup>
  );
};
