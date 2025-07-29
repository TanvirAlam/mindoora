import styled from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";
import Link from "next/link";

const Row = styled.div`
  width: 100%;

  &::before,
  &::after {
    content: " ";
    display: table;
  }

  &::after {
    clear: both;
  }
`;

const Column = styled.div`
  box-sizing: border-box;
  position: relative;
  float: left;
  display: block;

  &:not(:first-child) {
    margin-left: 1.6%;
  }

  &.column-3 {
    width: 23.8%;

    @media (max-width: ${size.md}) {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }

  &.column-4 {
    width: 32.2666666667%;
  }

  &.column-6 {
    width: 49.2%;

    @media (max-width: ${size.md}) {
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }

  &.column-7 {
    width: 100%;
    padding-bottom: 20px;
  }
`;

const StyledColumn = styled(Column)`
  border-radius: 4px;
  padding: 5px;
  min-height: 30px;
  text-align: center;
`;

const StyledColumnImageCarosal = styled(Column)`
  border-radius: 4px;
  padding: 5px;
  min-height: 30px;
  text-align: center;
  overflow: auto;
`;

const StyledRow = styled(Row)`
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: ${size.lg}) {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }

  @media (max-width: ${size.md}) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

const GameVisibilityButtonLabel = styled.label`
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  padding: 8px 20px;
  border-radius: 0.8rem;
  min-width: 124px;
  text-align: center;
  background: rgba(78, 190, 150, 0.1);
  border: 0.5px solid rgba(22, 179, 124, 0.2);
  cursor: pointer;

  &:before {
    content: "Check";
    color: #4ebe96;
  }

  &:active {
    transform: scale(0.94);
  }
`;

const GameVisibilityButton = styled.input`
  position: fixed;
  opacity: 0;
  visibility: hidden;

  &:checked + ${GameVisibilityButtonLabel} {
    background: rgba(216, 79, 104, 0.1);
    border-color: rgba(216, 79, 104, 0.2);
  }

  &:checked + ${GameVisibilityButtonLabel}:before {
    content: "Uncheck";
    color: #d84f68;
  }
`;

const SwitchContainer = styled.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
`;

const SwitchSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 34px;
  transition: 0.4s;

  &:before {
    position: absolute;
    content: "";
    height: 26px;
    width: 26px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    border-radius: 50%;
    transition: 0.4s;
  }
`;

const SwitchInput = styled.input`
  display: none;

  &:checked + ${SwitchSlider} {
    background-color: #2196f3;
  }

  &:checked + ${SwitchSlider}:before {
    transform: translateX(26px);
  }
`;

const InputContainer = styled.div`
  display: flex;
  background: white;
  border-radius: 1rem;
  background: linear-gradient(135deg, #23272f 0%, #14161a 100%);
  box-shadow: 10px 10px 20px #0e1013, -10px -10px 40px #383e4b;
  padding: 0.2rem;
  gap: 0.3rem;
`;

const GeneratedInput = styled.input`
  border-radius: 0.8rem 0 0 0.8rem;
  background: #23272f;
  box-shadow: inset 5px 5px 10px #0e1013, inset -5px -5px 10px #383e4b,
    0px 0px 100px rgba(255, 212, 59, 0), 0px 0px 100px rgba(255, 102, 0, 0);
  width: 100%;
  flex-basis: 75%;
  padding: 1rem;
  border: none;
  border: 1px solid transparent;
  color: white;
  transition: all 0.2s ease-in-out;

  &:focus {
    border: 1px solid #ffd43b;
    outline: none;
    box-shadow: inset 0px 0px 10px rgba(255, 102, 0, 0.5),
      inset 0px 0px 10px rgba(255, 212, 59, 0.5),
      0px 0px 100px rgba(255, 212, 59, 0.5),
      0px 0px 100px rgba(255, 102, 0, 0.5);
  }
`;

const GeneratedButton = styled.button`
  flex-basis: 25%;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgb(255, 212, 59) 0%,
    rgb(255, 102, 0) 100%
  );
  box-shadow: 0px 0px 1px rgba(255, 212, 59, 0.5),
    0px 0px 1px rgba(255, 102, 0, 0.5);
  font-weight: 900;
  letter-spacing: 0.3rem;
  text-transform: uppercase;
  color: #23272f;
  border: none;
  width: 50%;
  border-radius: 0 1rem 1rem 0;
  transition: all 0.2s ease-in-out;

  &:hover {
    background: linear-gradient(
      135deg,
      rgb(255, 212, 59) 50%,
      rgb(255, 102, 0) 100%
    );
    box-shadow: 0px 0px 100px rgba(255, 212, 59, 0.5),
      0px 0px 100px rgba(255, 102, 0, 0.5);
  }
`;

const QuestionCreationBox = styled.div`
  position: relative;
  width: 350px;
  padding: 5px;
  box-sizing: border-box;
  border-radius: 10px;
`;

const QuestionBox = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  margin-top: 20px;
  margin-bottom: 20px;

  span {
    font-size: 12px;
    color: #c0c0c0;
    text-transform: uppercase;
  }

  input {
    width: 150%;
    padding: 10px 0;
    font-size: 16px;
    color: #000;
    margin-bottom: 30px;
    border: none;
    border-bottom: 1px solid #000;
    outline: none;
    background: transparent;
  }

  label {
    position: absolute;
    top: 0;
    left: 0;
    padding: 10px 0;
    font-size: 16px;
    color: #000;
    pointer-events: none;
    transition: 0.5s;
  }

  input:focus ~ label,
  input:valid ~ label {
    top: -20px;
    left: 0;
    color: #bdb8b8;
    font-size: 12px;
  }

  select {
    position: relative;
    background: none;
    color: inherit;
    box-shadow: none;
    flex: 1;
    padding-top: 2rem;
    padding-bottom: 1rem;
    cursor: pointer;
    border-bottom: 1px solid #000;
  }
`;

const QuestionBoxTextArea = styled.div`
  span {
    font-size: 12px;
    color: #c0c0c0;
    text-transform: uppercase;
  }

  textarea {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    resize: none;
    color: #000;
    height: 96px;
    border-bottom: 1px solid #000;
    background-color: transparent;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #232752;
    }
  }
`;

const GenerateRandomName = styled(Link)`
  position: absolute;
  right: 0;
  top: 0.5rem;
  dispplay: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    color: orange;
    font-weight: 800;
  }

  svg {
    color: #232752;

    &:hover {
      color: #f28b7c;
    }
  }
`;

export const Styled = {
  Row,
  Column,
  StyledColumn,
  StyledColumnImageCarosal,
  StyledRow,
  GameVisibilityButton,
  GameVisibilityButtonLabel,
  SwitchContainer,
  SwitchSlider,
  SwitchInput,
  InputContainer,
  GeneratedInput,
  GeneratedButton,
  QuestionCreationBox,
  QuestionBox,
  QuestionBoxTextArea,
  GenerateRandomName,
};
