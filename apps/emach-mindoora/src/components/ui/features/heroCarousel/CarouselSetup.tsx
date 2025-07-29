import "swiper/css";
import { Keyboard, Mousewheel, Autoplay } from "swiper";
import { breakpoint } from "./CarouselBreakpoint";
import { Styled } from "./CarouselSetup.styled";

export const CarouselSetup = ({
  children,
}: {
  children: React.ReactNode[];
}) => {
  return (
    <Styled.CustomSwiper
      slidesPerView={1}
      spaceBetween={5}
      freeMode={true}
      keyboard={{
        enabled: true,
      }}
      loop={true}
      autoplay={{
        delay: 0,
        pauseOnMouseEnter: false,
        stopOnLastSlide: false,
        waitForTransition: true,
        disableOnInteraction: false,
      }}
      speed={5000}
      allowTouchMove={false}
      breakpoints={breakpoint}
      modules={[Keyboard, Mousewheel, Autoplay]}
      className="w-full"
      observer={true}
      observeParents={true}
    >
      {children}
    </Styled.CustomSwiper>
  );
};
