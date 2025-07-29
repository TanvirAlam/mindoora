import styled from "@emotion/styled";
import { baseTheme } from "~/ui/components/foundations/theming";
import { size } from "~/ui/components/foundations/breakpoints/device";
import { BoxShadow } from "~/styles/mixins.styled";

const QuestionsGenerator = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: 100%;
  padding: 0.625rem;
  border-radius: 0.625rem;
  position: relative;

  select {
    appearance: none;
    border: 0;
    outline: 0;
    background: none;
    color: inherit;
    box-shadow: none;
    flex: 1;
    padding: 1em;
    cursor: pointer;
  }
`;

const Questionsflex = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.375rem;

  @media (min-width: ${size.lg}) {
    flex-direction: row;
  }

  label {
    position: relative;
    width: 100%;
  }

  label .input {
    width: 100%;
    padding: 10px 10px 20px 10px;
    outline: 0;
    border: 1px solid rgba(105, 105, 105, 0.397);
    border-radius: 10px;
  }

  label .input + span {
    position: absolute;
    left: 10px;
    top: 15px;
    color: grey;
    font-size: 0.9em;
    cursor: text;
    transition: 0.3s ease;
  }

  label .input:placeholder-shown + span {
    top: 15px;
    font-size: 0.9em;
  }

  label .input:focus + span,
  label .input:valid + span {
    top: 30px;
    font-size: 0.7em;
    font-weight: 600;
  }

  label .input:valid + span {
    color: green;
  }
`;

const QuestionsLabel = styled.label`
  position: relative;
  display: flex;
  width: 100%;
  background: linear-gradient(to left, #613c92 3rem, #7c5aa5 3rem);
  border-radius: 0.25rem;
  overflow: hidden;
  color: #fff;

  ::after {
    content: "▼";
    position: absolute;
    right: 1rem;
    top: 1rem;
    transition: 0.25s all ease;
    pointer-events: none;
  }
`;

const QuestionsGeneratorResults = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  width: 100%;
  height: 20rem;
  border-radius: 0.625rem;
  overflow: auto;
`;

const QuestionsDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 0.8rem;
  background: linear-gradient(to right, #613c92 3rem, #613c92 3rem);
  width: 100%;
  border-radius: 0.625rem;
  ${BoxShadow}
`;

const QuestionsSelections = styled.div`
  background: red;
  width: 30%;
  height: 9.375rem;
`;

const Question = styled.h4`
  font-weight: 500;
  margin-bottom: 0.125rem;
  color: #fff;
  text-decoration: none;
  transition: 0.3s;
  font-size: 0.9em;
`;

const QuestionWrapper = styled.div`
  display: flex;
`;

const IncorrectAnswers = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;

  @media (min-width: ${size.lg}) {
    flex-direction: row;
  }
`;

const IncorrectAnswer = styled.li`
  background: rgb(235, 235, 228);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3125rem;
  font-weight: 500;
  font-size: 0.7em;
  gap: 0.625rem;
  color: #000;
  border-radius: 0.625rem;
  ${BoxShadow}
`;

const CorrectAnswer = styled.li`
  background: #31a400;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3125rem;
  font-weight: 500;
  font-size: 0.7em;
  color: #fff;
  border-radius: 0.625rem;
  gap: 0.625rem;
  ${BoxShadow}
`;

const SelectQuestion = styled.input`
  appearance: none;
  width: 1.875rem;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  border: 0.125rem solid black;
  position: relative;
  transition: all 0.2s ease-in-out;

  &::before {
    font-family: "Quicksand", sans-serif;
    position: absolute;
    bottom: -0.625rem;
    left: 0.0625rem;
    content: "✔";
    font-size: 2.5rem;
    color: rgb(255, 153, 0);
    transform: scale(0);
    transition: all 0.2s ease-in-out;
  }

  &:checked::before {
    animation: zoom 0.5s ease-in-out;
    transform: scale(1);
  }

  @keyframes zoom {
    0% {
      transform: scale(0);
    }

    20% {
      transform: scale(1.5);
    }

    40% {
      transform: scale(0.5);
    }

    50% {
      transform: scale(1);
    }

    70% {
      transform: scale(1.2);
    }

    90% {
      transform: scale(0.8);
    }

    100% {
      transform: scale(1);
    }
  }
`;

const QuestionsDetailCategories = styled.div`
  display: flex;
  gap: 0.625rem;
  padding-top: 0.625rem;
`;

const QCategory = styled.div`
  background: #7c5aa5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.625rem;
  font-weight: 500;
  font-size: 0.6em;
  color: #fff;
  padding: 0.4rem;
  ${BoxShadow}
`;

const QType = styled.div`
  background: #5c5346;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.625rem;
  font-weight: 500;
  font-size: 0.6em;
  color: #fff;
  padding: 0.3125rem;
  ${BoxShadow}
`;
const StyledOption = styled.option`
  background-color: #7c5aa5;

  &:hover {
    color: purple;
  }
`;

export const Styled = {
  QuestionsGenerator,
  Questionsflex,
  QuestionsLabel,
  QuestionsGeneratorResults,
  QuestionsDetails,
  QuestionsSelections,
  Question,
  QuestionWrapper,
  IncorrectAnswers,
  IncorrectAnswer,
  CorrectAnswer,
  SelectQuestion,
  QuestionsDetailCategories,
  QCategory,
  QType,
  StyledOption,
};
