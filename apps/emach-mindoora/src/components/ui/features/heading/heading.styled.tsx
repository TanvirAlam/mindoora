import { styled } from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";

const HeadingNeonColor = styled.div`
  position: absolute;
  font-family: "Archivo Black", sans-serif;
  background: #0b103e;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  bottom: 0;
  right: 0;
  transform: translate(-50%, -50%);

  @media (max-width: ${size.md}) {
    left: 50%;
    bottom: -20px;
  }

  .words {
    color: #0b103e;
    font-size: 0;
    line-height: 1;
  }

  .words span {
    font-size: 2rem;
    display: inline-block;
    animation: move 3s ease-in-out infinite;
  }

  @keyframes move {
    0% {
      transform: translate(-30%, 0);
    }
    50% {
      text-shadow: 0 25px 50px rgba(255, 255, 255);
    }
    100% {
      transform: translate(30%, 0);
    }
  }

  .words span:nth-child(2) {
    animation-delay: 0.5s;
  }

  .words span:nth-child(3) {
    animation-delay: 1s;
  }

  .words span:nth-child(4) {
    animation-delay: 1.5s;
  }

  .words span:nth-child(5) {
    animation-delay: 2s;
  }

  .words span:nth-child(6) {
    animation-delay: 2.5s;
  }

  .words span:nth-child(7) {
    animation-delay: 3s;
  }
`;

const HeadingNeonColorWhite = styled(HeadingNeonColor)`
  background: #ebf0fc;

  .words {
    color: #c1c1c1;
  }

  .words span {
    animation: move-w 3s ease-in-out infinite;
  }

  @keyframes move-w {
    0% {
      transform: translate(-30%, 0);
    }
    50% {
      text-shadow: 0 25px 50px rgba(0, 0, 0);
    }
    100% {
      transform: translate(30%, 0);
    }
  }
`;

const HeadingColorChange = styled.div`
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-align: center;
  color: #f35626;
  background-image: -webkit-linear-gradient(92deg, #f35626, #feab3a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  -webkit-animation: hue 10s infinite linear;
  position: absolute;
  left: 40px;
  top: 140px;

  @keyframes hue {
    from {
      -webkit-filter: hue-rotate(0deg);
    }
    to {
      -webkit-filter: hue-rotate(-360deg);
    }
  }
`;

const HeadingRandomWords = styled.div`
  position: absolute;
`;

const HeadingBlinking = styled.div`
  animation: text-flicker-out-glow 2.5s linear infinite both;
  font: 50px/1 "TeXGyreAdventorBold";
  text-transform: none;
  text-align: center;
  font-family: monospace;
  position: absolute;
  left: 200px;
  top: 120px;
  color: #fff;

  @media (max-width: ${size.md}) {
    top: 100px;
    left: 80px;
  }

  @keyframes text-flicker-out-glow {
    0% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.6),
        0 0 60px rgba(255, 255, 255, 0.45), 0 0 110px rgba(255, 255, 255, 0.25),
        0 0 100px rgba(255, 255, 255, 0.1);
    }
    13.9% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.6),
        0 0 60px rgba(255, 255, 255, 0.45), 0 0 110px rgba(255, 255, 255, 0.25),
        0 0 100px rgba(255, 255, 255, 0.1);
    }
    14% {
      opacity: 0;
      text-shadow: none;
    }
    14.9% {
      opacity: 0;
      text-shadow: none;
    }
    15% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.55),
        0 0 60px rgba(255, 255, 255, 0.4), 0 0 110px rgba(255, 255, 255, 0.2),
        0 0 100px rgba(255, 255, 255, 0.1);
    }
    22.9% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.55),
        0 0 60px rgba(255, 255, 255, 0.4), 0 0 110px rgba(255, 255, 255, 0.2),
        0 0 100px rgba(255, 255, 255, 0.1);
    }
    23% {
      opacity: 0;
      text-shadow: none;
    }
    24.9% {
      opacity: 0;
      text-shadow: none;
    }
    25% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.55),
        0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1);
    }
    34.9% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.55),
        0 0 60px rgba(255, 255, 255, 0.35), 0 0 100px rgba(255, 255, 255, 0.1);
    }
    35% {
      opacity: 0;
      text-shadow: none;
    }
    39.9% {
      opacity: 0;
      text-shadow: none;
    }
    40% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.55),
        0 0 60px rgba(255, 255, 255, 0.35);
    }
    42.9% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.55),
        0 0 60px rgba(255, 255, 255, 0.35);
    }
    43% {
      opacity: 0;
      text-shadow: none;
    }
    44.9% {
      opacity: 0;
      text-shadow: none;
    }
    45% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.45),
        0 0 60px rgba(255, 255, 255, 0.25);
    }
    50% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.45),
        0 0 60px rgba(255, 255, 255, 0.25);
    }
    54.9% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.45),
        0 0 60px rgba(255, 255, 255, 0.25);
    }
    55% {
      opacity: 0;
      text-shadow: none;
    }
    69.4% {
      opacity: 0;
      text-shadow: none;
    }
    69.5% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.45),
        0 0 60px rgba(255, 255, 255, 0.25);
    }
    69.9% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.45),
        0 0 60px rgba(255, 255, 255, 0.25);
    }
    70% {
      opacity: 0;
      text-shadow: none;
    }
    79.4% {
      opacity: 0;
      text-shadow: none;
    }
    79.9% {
      opacity: 1;
      text-shadow: 0 0 30px rgba(255, 255, 255, 0.25);
    }
    80% {
      opacity: 0;
      text-shadow: none;
    }
    89.8% {
      opacity: 0;
      text-shadow: none;
    }
    89.9% {
      opacity: 1;
      text-shadow: none;
    }
    90% {
      opacity: 0;
      text-shadow: none;
    }
    100% {
      opacity: 0;
    }
  }
`;

const HeadingBlinkingBlack = styled(HeadingBlinking)`
  color: #000;
`;

const HeadingSquize = styled.div`
  position: absolute;

  .container {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 4em;
    filter: contrast(800);
    overflow: hidden;
  }

  h1 {
    color: white;
    font-size: 5rem;
    font-weight: 700;
    text-transform: uppercase;
    line-height: 1;
    filter: blur(0.5rem);
    animation: letterspacing 10s infinite alternate cubic-bezier(0.2, 0, 0, 1);
    display: block;
    position: absolute;
    top: 12rem;
    transform: translate3d(-50%, -50%, 0);

    @media (max-width: ${size.sm}) {
      top: 10rem;
      transform: translate3d(-20%, -50%, 0);
    }
  }

  @keyframes letterspacing {
    0% {
      letter-spacing: -5rem;
      filter: blur(0.5rem);
    }

    50% {
      filter: blur(0.5rem);
    }

    100% {
      letter-spacing: 1rem;
      filter: blur(1.5rem);
    }
  }
`;

const HeadingSquizeWhite = styled(HeadingSquize)`
  h1 {
    color: black;
  }
`;

const HeadingNormal = styled.h1`
  display: flex;
  justify-content: center;

  @media (max-width: ${size.sm}) {
    margin-top: 2rem;
  }

  span {
    font-size: 4rem;
    font-family: "Alfa Slab One", cursive;

    @media (max-width: ${size.sm}) {
      font-size: 1.7rem;
      width: 100%;
    }
  }
`;

const SubHeadingNormal = styled.p`
  font-size: 1.6rem;
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: start;
  text-align: left;
  padding-left: 1rem;
  padding-right: 1rem;

  @media (max-width: ${size.md}) {
    font-size: 1.4rem;
    width: 100%;
  }
`;

const HeadingEffect = styled.h1`
  display: flex;
  padding: 3rem;

  @media (min-width: ${size.lg}) {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  span {
    animation: shake 0.5s infinite;
    font-size: 2rem;

    @media (max-width: ${size.sm}) {
      font-size: 1.5rem;
    }
  }

  @keyframes shake {
    0% {
      transform: translate(1px, -2px) rotate(-1deg);
    }
    10% {
      transform: translate(-1px, 2px) rotate(-1deg);
    }
    20% {
      transform: translate(1px, 2px) rotate(0deg);
    }
    30% {
      transform: translate(3px, 2px) rotate(0deg);
    }
    40% {
      transform: translate(1px, -1px) rotate(1deg);
    }
    50% {
      transform: translate(-1px, -2px) rotate(-1deg);
    }
    60% {
      transform: translate(-3px, 1px) rotate(0deg);
    }
    70% {
      transform: translate(3px, 1px) rotate(-1deg);
    }
    80% {
      transform: translate(-1px, -1px) rotate(1deg);
    }
    90% {
      transform: translate(-3px, 0px) rotate(1deg);
    }
    100% {
      transform: translate(1px, 1px) rotate(0deg);
    }
  }
`;

export const Styled = {
  HeadingEffect,
  HeadingNormal,
  HeadingSquize,
  HeadingBlinking,
  HeadingRandomWords,
  HeadingColorChange,
  HeadingNeonColor,
  HeadingNeonColorWhite,
  HeadingSquizeWhite,
  HeadingBlinkingBlack,
  SubHeadingNormal,
};
