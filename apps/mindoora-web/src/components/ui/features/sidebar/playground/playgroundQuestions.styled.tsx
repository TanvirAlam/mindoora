import { styled } from "styled-components";

const Checklist = styled.div`
  --background: transparent;
  --text: #414856;
  --check: #fcae2c;
  --disabled: #fcae2c;
  --width: 100%;
  --height: 100%;
  --border-radius: 10px;
  background: var(--background);
  width: var(--width);
  height: var(--height);
  border-radius: var(--border-radius);
  position: relative;
  padding: 10px;
  display: grid;
  grid-template-columns: 30px auto;
  align-items: center;
  justify-content: center;
  padding-bottom: 10px;
  overflow: auto;

  @media screen and (max-width: 768px) {
  --height: 25vh;
}

  label {
    color: var(--text);
    position: relative;
    display: grid;
    align-items: center;
    width: fit-content;
    transition: color 0.3s ease;
    margin-right: 20px;

    &::before,
    &::after {
      content: "";
      position: absolute;
    }

    &::before {
      height: 2px;
      width: 8px;
      left: -27px;
      background: var(--check);
      border-radius: 2px;
      transition: background 0.3s ease;
    }

    &:after {
      height: 4px;
      width: 4px;
      top: 8px;
      left: -25px;
      border-radius: 50%;
    }
  }

  input[type="radio"] {
    -webkit-appearance: none;
    -moz-appearance: none;
    position: relative;
    height: 15px;
    width: 15px;
    outline: none;
    border: 0;
    margin: 0 15px 0 0;
    cursor: pointer;
    background: var(--background);
    display: grid;
    align-items: center;
    margin-right: 20px;

    &::before,
    &::after {
      content: "";
      position: absolute;
      height: 2px;
      top: auto;
      background: var(--check);
      border-radius: 2px;
    }

    &::before {
      width: 0px;
      right: 60%;
      transform-origin: right bottom;
    }

    &::after {
      width: 0px;
      left: 40%;
      transform-origin: left bottom;
    }

    &:checked::before {
      animation: check-01 0.4s ease forwards;
    }

    &:checked::after {
      animation: check-02 0.4s ease forwards;
    }

    &:checked + label {
      color: var(--disabled);
      animation: move 0.3s ease 0.1s forwards;
      transform: scale(1.3);
      margin-left: 30px;
      padding: 5px;
    }

    &:checked + label::before {
      background: var(--disabled);
      animation: slice 0.4s ease forwards;
    }

    &:checked + label::after {
      animation: firework 0.5s ease forwards 0.1s;
    }
  }

  @keyframes move {
    50% {
      padding-left: 8px;
      padding-right: 0px;
    }

    100% {
      padding-right: 4px;
    }
  }

  @keyframes slice {
    60% {
      width: 0%;
      left: 4px;
    }

    100% {
      width: 0%;
      left: -2px;
      padding-left: 0;
    }
  }

  @keyframes check-01 {
    0% {
      width: 4px;
      top: auto;
      transform: rotate(0);
    }

    50% {
      width: 0px;
      top: auto;
      transform: rotate(0);
    }

    51% {
      width: 0px;
      top: 8px;
      transform: rotate(45deg);
    }

    100% {
      width: 5px;
      top: 8px;
      transform: rotate(45deg);
    }
  }

  @keyframes check-02 {
    0% {
      width: 4px;
      top: auto;
      transform: rotate(0);
    }

    50% {
      width: 0px;
      top: auto;
      transform: rotate(0);
    }

    51% {
      width: 0px;
      top: 8px;
      transform: rotate(-45deg);
    }

    100% {
      width: 10px;
      top: 8px;
      transform: rotate(-45deg);
    }
  }

  @keyframes firework {
    0% {
      opacity: 1;
      box-shadow: 0 0 0 -2px #fcae2c, 0 0 0 -2px #fcae2c, 0 0 0 -2px #fcae2c,
        0 0 0 -2px #fcae2c, 0 0 0 -2px #fcae2c, 0 0 0 -2px #fcae2c;
    }

    30% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      box-shadow: 0 -15px 0 0px #fcae2c, 14px -8px 0 0px #fcae2c,
        14px 8px 0 0px #fcae2c, 0 15px 0 0px #fcae2c, -14px 8px 0 0px #fcae2c,
        -14px -8px 0 0px #fcae2c;
    }
  }
`;

export const Styled = {
  Checklist,
};
