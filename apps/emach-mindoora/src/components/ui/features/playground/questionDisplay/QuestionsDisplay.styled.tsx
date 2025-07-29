import { styled, css } from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";

const StopGame = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 200px;
  height: 40px;
  border: none;
  padding: 0px 20px;
  background-color: rgb(168, 38, 255);
  color: white;
  font-weight: 500;
  cursor: pointer;
  border-radius: 10px;
  box-shadow: 5px 5px 0px rgb(140, 32, 212);
  transition-duration: 0.3s;

  @media (max-width: ${size.md}) {
    font-size: 0.8rem;
  }

  img {
    width: 25px;
    position: absolute;
    right: 0;
    margin-right: 20px;
    fill: white;
    transition-duration: 0.3s;
  }

  &:hover {
    color: transparent;
  }

  &:hover img {
    right: 43%;
    margin: 0;
    padding: 0;
    border: none;
    transition-duration: 0.3s;
  }

  &:active {
    transform: translate(3px, 3px);
    transition-duration: 0.3s;
    box-shadow: 2px 2px 0px rgb(140, 32, 212);
  }

  ${(props) =>
    props.disabled &&
    css`
      background: #ccc;
      color: #888;
      border: 1px solid #aaa;
      pointer-events: none;
    `}
`;

const SubmitButton = styled.button`
  background-color: rgb(76, 38, 255, 0.8);
  box-shadow: 5px 5px 0px rgb(76, 38, 255, 0.5);
`;

const ShowResult = styled(StopGame)`
  background-color: rgb(96, 98, 25, 0.8);
  box-shadow: 5px 5px 0px rgb(96, 98, 25, 0.5);
  color: #fff;
  font-size: 18px;
  border-radius: 0.5em;
  background: #4d297b;
  border: 1px solid #212121;
  transition: all 0.3s;
  box-shadow: 6px 6px 12px #000, -6px -6px 12px #2f2f2f;
  width: 150px;
  display: flex;
  position: relative;
  justify-content: center;

  @media (max-width: ${size.md}) {
    font-size: 12px;
    width: 90px;
    flex-direction: row;

    span {
      display: none;
    }
  }
`;

interface RadioBtnProps {
  color: string;
}

const AnswerImage = styled.img`
  position: absolute;
  display flex;
  z-index: 999;
  right: 20px;
  top: 15%;
  left: 45%;
  width: 200px;
  z-index: 1;

  @media (max-width: ${size.md}) {
    left: 22%;
  }
`;

const RadioBtn = styled.div<RadioBtnProps>`
  position: relative;
  display: block;
  font-size: 0.9em;
  font-weight: bold;

  label {
    display: block;
    background: ${(props) => props.color};
    color: #444;
    border-radius: 5px;
    padding: 10px 20px;
    border: 2px solid #fdd591;
    margin-bottom: 5px;
    cursor: pointer;

    &:after,
    &:before {
      content: "";
      position: absolute;
      right: 11px;
      top: 11px;
      width: 20px;
      height: 20px;
      border-radius: 3px;
      background: #fdcb77;
    }

    &:before {
      background: transparent;
      transition: 0.1s width cubic-bezier(0.075, 0.82, 0.165, 1) 0s,
        0.3s height cubic-bezier(0.075, 0.82, 0.165, 2) 0.1s;
      z-index: 2;
      overflow: hidden;
      background-repeat: no-repeat;
      background-size: 13px;
      background-position: center;
      width: 0;
      height: 0;
      background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNS4zIDEzLjIiPiAgPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTE0LjcuOGwtLjQtLjRhMS43IDEuNyAwIDAgMC0yLjMuMUw1LjIgOC4yIDMgNi40YTEuNyAxLjcgMCAwIDAtMi4zLjFMLjQgN2ExLjcgMS43IDAgMCAwIC4xIDIuM2wzLjggMy41YTEuNyAxLjcgMCAwIDAgMi40LS4xTDE1IDMuMWExLjcgMS43IDAgMCAwLS4yLTIuM3oiIGRhdGEtbmFtZT0iUGZhZCA0Ii8+PC9zdmc+);
    }
  }

  input[type="radio"] {
    display: none;
    position: absolute;
    width: 100%;
    appearance: none;

    &:checked + label {
      animation-name: blink;
      animation-duration: 1s;
      border-color: #fcae2c;

      &:after {
        background: #fcae2c;
      }

      &:before {
        width: 20px;
        height: 20px;
      }
    }
  }
`;

const QuestionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  margin: 30px;
  background: #287bff;
  border-radius: 20px;
  border-bottom-left-radius: 160px;
  border-bottom-right-radius: 160px;
  box-shadow: 0 15px 0 #fff, inset 0 -15px 0 rgba(255, 255, 255, 0.25),
    0 45px 0 rgba(0, 0, 0, 0.15);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -140px;
    left: -40%;
    width: 100%;
    height: 120%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25));
    transform: rotate(35deg);
    pointer-events: none;
    filter: blur(5px);
  }

  &:nth-child(1) {
    background: linear-gradient(to bottom, #2e026d, #645bf6);
  }

  &:nth-child(2) {
    background: linear-gradient(to bottom, #2e026d, #f65b9c);
  }

  &:nth-child(3) {
    background: linear-gradient(to bottom, #2e026d, #f65b5b);
  }
`;

const QuestionWrapperGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
  grid-auto-rows: 2rem;
  grid-gap: 2em;
  padding: 4rem;
  margin-bottom: 2rem;

  @media (max-width: ${size.sm}) {
    padding-bottom: 4rem;
  }
`;

const Question = styled.div`
  color: #fff;
  display: flex;
  justify-content: center;
  font-size: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;

  @media (max-width: ${size.md}) {
    padding-left: 1rem;
    padding-right: 1rem;
    font-size: 1.5rem;
    display: flex;
    justify-content: center;
    text-align: center;
  }
`;

const QuestionsAnsCTAClose = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  gap: 1rem;

  @media (max-width: ${size.md}) {
    flex-direction: column;
  }
`;

const QuestionsAnsCTANextLeft = styled.div`
  position: absolute;
  top: 0.9375rem;
  right: 0.9375rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const QuestionsAnsCTANextRight = styled.div`
  position: absolute;
  top: 0.9375rem;
  left: 0.9375rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const TimerSection = styled.div<{ seconds: number }>`
  position: relative;
  width: 120px;
  height: 120px;
  background: #3c2846;
  border-bottom-left-radius: 3.25rem;
  border-bottom-right-radius: 3.25rem;
  box-shadow: 0 10px 0 rgba(0, 0, 0, 0.1),
    inset 0 -15px 0 ${(props) => (props.seconds < 10 ? "red" : "#fff")},
    inset 0 5px 0 ${(props) => (props.seconds < 10 ? "yellow" : "#fff")};
  transition: all 0.3s ease-in-out;
  animation: ${(props) => (props.seconds < 10 ? "alarmColor" : "#fff")} 1s
    infinite;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  top: -40px;

  @keyframes alarmColor {
    0% {
      box-shadow: 10px 20px 30px yellow;
    }
    50% {
      box-shadow: 10px 20px 30px red;
    }
    100% {
      box-shadow: 10px 20px 30px green;
    }
  }
`;

export const Styled = {
  QuestionWrapper,
  Question,
  SubmitButton,
  ShowResult,
  StopGame,
  RadioBtn,
  QuestionWrapperGrid,
  QuestionsAnsCTAClose,
  QuestionsAnsCTANextLeft,
  QuestionsAnsCTANextRight,
  TimerSection,
  AnswerImage,
};
