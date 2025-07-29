import styled from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";
import { BoxShadow } from "~/styles/mixins.styled";

const QuestionCreatedWrapper = styled.div`
  max-width: 100%;
  height: 550px;
  margin: 0;
  overflow: auto;

  .no-games-created {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .accordion {
    background-color: #7c5aa8;
    color: #fff;
    cursor: pointer;
    padding: 18px;
    width: 100%;
    border: none;
    text-align: left;
    outline: none;
    font-size: 1em;
    transition: 0.4s;
    font-weight: bold;
    border-radius: 10px;
    border: 2px solid #fff;

    &:last-of-type {
      border-bottom: 0;
    }

    &:hover {
      background-color: #e0e0e0;
      color: #000;
    }

    &:active {
      color: #7c5aa8;
    }
  }

  .panel {
    padding: 0 18px;
    background-color: #fff;
    height: 400px;
    overflow: hidden;
    transition: max-height 0.2s ease-out;
    box-shadow: none !important;
  }
`;

const QuestionActions = styled.div`
  display: flex;

  @media (max-width: ${size.md}) {
    display: none;
  }

  .navigation {
    position: relative;
    width: 40px;
    height: 100%;
    background: transparent;
    border-radius: 10px;
    cursor: pointer;
    transition: 0.5s;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .navigation.active {
    width: 200px;
  }

  .navigation span {
    position: absolute;
    width: 6px;
    height: 6px;
    background: #222327;
    border-radius: 50%;
    transition: 0.5s;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 3px solid #fff;
  }

  .navigation span:nth-child(1) {
    transform: translateY(-12px);
  }

  .navigation span:nth-child(3) {
    transform: translateY(12px);
  }

  .navigation.active span {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.2s;
  }

  .navigation.active span:nth-child(1) {
    transform: translateY(0) translateX(-60px);
  }

  .navigation.active span:nth-child(3) {
    transform: translateY(0) translateX(60px);
  }

  .navigation span i {
    color: #222327;
    transition: 0.1s;
  }

  .navigation.active span i {
    font-size: 1.25em;
    color: #fff;
  }

  .navigation.active span:hover {
    background: #29fd53;
  }

  .navigation.active span:hover i {
    color: #222327;
  }
`;

const QuestionTypeImage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;

  .question-side-image {
    display: flex;

    @media (max-width: ${size.md}) {
      display: none;
    }
  }
`;

const QuestionAnswers = styled.div`
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 0.875rem;
  font-weight: bold;
  display: flex;
  flex-direction: row;
  gap: 10px;
  width: 100%;

  @media (max-width: ${size.md}) {
    font-size: 0.975rem;
    flex-direction: column;
  }

  .container {
    max-width: 60em;
    margin-right: auto;
    margin-left: auto;
    box-shadow: none !important;
  }

  .col {
    padding: 1em;
    margin: 0 2px 2px 0;
    box-shadow: none;
  }

  .input-container {
    position: relative;
    margin: 10px;
  }

  /* Input field */
  .input-field {
    display: block;
    width: 100%;
    font-size: 30px;
    border: none;
    border-bottom: 2px solid #ccc;
    outline: none;
    background-color: transparent;
  }

  /* Input label */
  .input-label {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 10px;
    color: rgba(204, 204, 204, 0);
    pointer-events: none;
    transition: all 0.3s ease;
  }

  /* Input highlight */
  .input-highlight {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 0;
    background-color: #7c5aa5;
    transition: all 0.3s ease;
  }

  /* Input field:focus styles */
  .input-field:focus + .input-label {
    top: -20px;
    font-size: 12px;
    color: #7c5aa5;
  }

  .input-field:focus + .input-label + .input-highlight {
    width: 100%;
  }
`;

const QuestionAnswersBox = styled.div<{ CorrectAns: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    background-color: #3ca80e;
    color: #fff;
    font-size: 0.5rem;
    padding: 4px;
    border-radius: 40px;
  }

  &:after {
    content: ${(props) => (props.CorrectAns ? "Correct" : "")};
  }
`;

const SubTitle = styled.div`
 text-align: center; 
  font-weight: bold;
  font-size: 30px;
  padding: 11px 0; 
  border-bottom: 2px solid #4d297b;
  margin: auto; 
  margin-bottom: 20px;
`;

export const Styled = {
  QuestionCreatedWrapper,
  QuestionActions,
  QuestionTypeImage,
  QuestionAnswers,
  QuestionAnswersBox,
  SubTitle,
};
