import React from "react";
import Image from "next/image";
import { Styled } from "./CarouselItem.styled";

const CardDescription = ({
  isTextColor,
  gameName,
}: {
  isTextColor: boolean;
  gameName: string;
}) => {
  return (
    <Styled.DescriptionCard
      isTextColor={isTextColor}
      className="absolute bottom-[-0.1rem] mx-auto rounded-lg border-0 p-4"
    >
      <Styled.CardTitle>
        <span>{gameName}</span>
      </Styled.CardTitle>
    </Styled.DescriptionCard>
  );
};

export default CardDescription;
