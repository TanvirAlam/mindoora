import { LandingPageJoinButton } from "../../elements/LandingPageJoinButton";
import { Styled } from "./heading.styled";

type HeadingType = {
  title: string;
  color?: string;
};

export const HeadingShake = ({ title, color }: HeadingType) => {
  return (
    <Styled.HeadingEffect style={{ color: color }}>
      <span>{title}</span>
    </Styled.HeadingEffect>
  );
};

export const HeadingNormal = ({ title, color }: HeadingType) => {
  return (
    <Styled.HeadingNormal style={{ color: color }}>
      <span>{title}</span>
    </Styled.HeadingNormal>
  );
};

export const HeadingParagraph = ({ title, color }: HeadingType) => {
  return (
    <Styled.HeadingNormal style={{ color: color }}>
      <span>{title}</span>
    </Styled.HeadingNormal>
  );
};

export const SubHeadingNormal = ({ title, color }: HeadingType) => {
  return (
    <Styled.SubHeadingNormal style={{ color: color }}>
      <span>{title}</span>
      <LandingPageJoinButton label="Sign Up Now !!!" color={color} />
    </Styled.SubHeadingNormal>
  );
};

export const HeadingSquize = ({ title }: HeadingType) => {
  return (
    <Styled.HeadingSquize>
      <div className="container">
        <h1>{title}</h1>
      </div>
    </Styled.HeadingSquize>
  );
};

export const HeadingSquizeWhite = ({ title }: HeadingType) => {
  return (
    <Styled.HeadingSquizeWhite>
      <div className="container">
        <h1>{title}</h1>
      </div>
    </Styled.HeadingSquizeWhite>
  );
};

export const HeadingBlinking = ({ title }: HeadingType) => {
  return <Styled.HeadingBlinking>{title}</Styled.HeadingBlinking>;
};

export const HeadingBlinkingBlack = ({ title }: HeadingType) => {
  return <Styled.HeadingBlinkingBlack>{title}</Styled.HeadingBlinkingBlack>;
};

export const HeadingColorChange = ({ title }: HeadingType) => {
  return <Styled.HeadingColorChange>{title}</Styled.HeadingColorChange>;
};

export const HeadingNeonColor = () => {
  return (
    <Styled.HeadingNeonColor>
      <div className="words word-1">
        <span>C</span>
        <span>H</span>
        <span>A</span>
        <span>L</span>
        <span>L</span>
        <span>E</span>
        <span>N</span>
        <span>G</span>
        <span>E</span>
      </div>

      <div className="words word-2">
        <span>T</span>
        <span>H</span>
        <span>E</span>
      </div>

      <div className="words word-3">
        <span>M</span>
        <span>I</span>
        <span>N</span>
        <span>D</span>
      </div>
    </Styled.HeadingNeonColor>
  );
};

export const HeadingNeonColorWhite = () => {
  return (
    <Styled.HeadingNeonColorWhite>
      <div className="words word-1">
        <span>C</span>
        <span>H</span>
        <span>A</span>
        <span>L</span>
        <span>L</span>
        <span>E</span>
        <span>N</span>
        <span>G</span>
        <span>E</span>
      </div>

      <div className="words word-2">
        <span>T</span>
        <span>H</span>
        <span>E</span>
      </div>

      <div className="words word-3">
        <span>M</span>
        <span>I</span>
        <span>N</span>
        <span>D</span>
      </div>
    </Styled.HeadingNeonColorWhite>
  );
};
