import styled from "@emotion/styled";
import { baseTheme } from "~/ui/components/foundations/theming";
import { size } from "~/ui/components/foundations/breakpoints/device";
import { BoxShadow } from "~/styles/mixins.styled";

const RadioForm = styled.div`
  display: block;
  margin: auto;
  max-width: 10em;
  position: relative;

  input {
    position: fixed;
    top: -1.5em;
    left: -1.5em;
    visibility: hidden;
  }

  label {
    cursor: pointer;
    display: block;
    font-weight: bold;
    text-shadow: 0 0.1em 0.1em rgba(0, 0, 0, 0.2);
    transition: color 0.2s cubic-bezier(0.45, 0.05, 0.55, 0.95);
  }

  label:not(:last-of-type) {
    margin-bottom: 1.5em;
  }

  label span {
    box-shadow: 0 0 0 0.2em currentColor inset, 0 0.2em 0.2em rgba(0, 0, 0, 0.2),
      0 0.3em 0.2em rgba(0, 0, 0, 0.2) inset;
    display: inline-block;
    margin-right: 0.5em;
    vertical-align: bottom;
    border-radius: 50%;
    width: 1.5em;
    height: 1.5em;
    transition: transform 0.2s cubic-bezier(0.5, 0, 0.5, 2),
      box-shadow 0.2s cubic-bezier(0.45, 0.05, 0.55, 0.95),
      color 0.2s cubic-bezier(0.45, 0.05, 0.55, 0.95);
  }

  input:checked + label,
  input:checked + label span {
    color: #255ff4;
  }

  input:checked + label,
  input:checked + label span {
    transition-delay: 0.4s;
  }

  label span {
    transform: scale(1.2);
  }

  .worm {
    top: 0.375em;
    left: 0.375em;
    position: absolute;
  }

  .worm__segment {
    position: absolute;
    top: 0;
    left: 0;
    width: 0.75em;
    height: 0.75em;
    border-radius: 50%;
    transition: transform 0.4s cubic-bezier(0.45, 0.05, 0.55, 0.95);
  }

  .worm__segment:before {
    animation-duration: 0.4s;
    animation-timing-function: cubic-bezier(0.45, 0.05, 0.55, 0.95);
    background: currentColor;
    content: "";
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }

  .worm__segment:first-child:before,
  .worm__segment:last-child:before {
    box-shadow: 0 0 1em 0 currentColor;
  }

  @keyframes hop1 {
    from,
    to {
      transform: translateX(0);
    }

    50% {
      transform: translateX(-1.5em);
    }
  }

  @keyframes hop2 {
    from,
    to {
      transform: translateX(0);
    }

    50% {
      transform: translateX(-1.5em);
    }
  }

  @keyframes hop3 {
    from,
    to {
      transform: translateX(0);
    }

    50% {
      transform: translateX(-1.5em);
    }
  }

  input:nth-of-type(1):checked ~ .worm .worm__segment {
    transform: translateY(0);
  }

  input:nth-of-type(1):checked ~ .worm .worm__segment:before {
    animation-name: hop1;
  }

  input:nth-of-type(2):checked ~ .worm .worm__segment {
    transform: translateY(3em);
  }

  input:nth-of-type(2):checked ~ .worm .worm__segment:before {
    animation-name: hop2;
  }

  input:nth-of-type(3):checked ~ .worm .worm__segment {
    transform: translateY(6em);
  }

  input:nth-of-type(3):checked ~ .worm .worm__segment:before {
    animation-name: hop3;
  }

  @media screen and (prefers-color-scheme: dark) {
    input:checked + label,
    input:checked + label span,
    .worm__segment:before {
      color: #5583f6;
    }
  }
`;

const creatInputs = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  align-items: center;
  gap: 1rem;
`;

const QuestionInputWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  align-items: start;
  flex-direction: column;
  gap: 10px;
`;

const deleteButton = styled.button`
  position: absolute;
  display: flex;
  justify-content: start;
  align-items: center;
  right: 80px;

  @media (max-width: ${size.sm}) {
    right: -8px;
  }
`;

export const Styled = {
  RadioForm,
  creatInputs,
  QuestionInputWrapper,
  deleteButton,
};
