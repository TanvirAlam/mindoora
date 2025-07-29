import { Styled } from "./AddQuestions.styled";
import Image from "next/image";

export const NoGamesCreated = () => {
    return (
      <Styled.NoGamesCreated>
        <Styled.MessageContainer>
          <img src="/assets/nogames.gif" />
          <Styled.Message>No Games Created!</Styled.Message>
        </Styled.MessageContainer>
      </Styled.NoGamesCreated>
    );
  };

  export const NoAnswer = () => {
    return (
      <Styled.NoGamesCreated>
        <Styled.MessageContainer>
          <Image
            src="/assets/no-answer.png"
            alt="no-ans"
            width={100}
            height={100}
          />
        </Styled.MessageContainer>
      </Styled.NoGamesCreated>
    );
  };
