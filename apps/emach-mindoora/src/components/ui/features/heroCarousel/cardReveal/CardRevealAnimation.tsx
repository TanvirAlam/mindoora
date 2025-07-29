import { useRef } from "react";
import { Styled } from "./CardRevealAnimation.styled";
import type { CarouselPropsType } from "~/types/type";
import { useTranslation } from "next-i18next";
import { CarouselColor } from "../CarouselColor";
import { CarouselWhite } from "../CarouselWhite";
import Image from "next/image";
import { HeadingNormal, SubHeadingNormal } from "../../heading";

export const CardRevealAnimation = ({ carouselList }: CarouselPropsType) => {
  const screenRef = useRef(null);
  const { t } = useTranslation();

  const handleScreenSwipe = (event: any) => {
    screenRef.current.style.width = `${
      (event.pageX ||
        Math.trunc(event.touches !== undefined && event.touches[0].pageX)) - 10
    }px`;
  };

  return (
    <Styled.Page
      onMouseMove={handleScreenSwipe}
      onMouseEnter={handleScreenSwipe}
      onMouseLeave={handleScreenSwipe}
      onTouchMove={handleScreenSwipe}
      onTouchStart={handleScreenSwipe}
    >
      <Styled.ContainerOne>
        <Image
          src="/assets/mindoora-svg-white.svg"
          width="400"
          height="100"
          alt="logo"
          className="top-1"
        />
        <HeadingNormal title={t("CREATE. PLAY. LEARN")} color={"#fff"} />
        <SubHeadingNormal
          title={t(
            "Weather you are a quiz lover or a teacher seeking new ways to engage your students, Mindoora offers the tools to build and play interactive & user-friendly quizes for FREE!"
          )}
          color={"#fff"}
        />
        <CarouselWhite isTextColor={true} carouselList={carouselList} />
      </Styled.ContainerOne>
      <Styled.Screen ref={screenRef} style={{ width: "50%" }}>
        <Styled.ContainerTwo>
          <Image
            src="/assets/mindoora-svg.svg"
            width="400"
            height="100"
            alt="logo"
            className="top-1"
          />
          <HeadingNormal title={t("DISCOVER. PLAY. LEARN")} color={"#4D297B"} />
          <SubHeadingNormal
            title={t(
              "Weather you are a quiz lover or a teacher seeking new ways to engage your students, Mindoora offers the tools to build and play interactive & user-friendly quizes for FREE!"
            )}
            color={"#2e026d"}
          />
          <CarouselColor isTextColor={false} carouselList={carouselList} />
        </Styled.ContainerTwo>
      </Styled.Screen>
    </Styled.Page>
  );
};
