import styled from "@emotion/styled";
import { baseTheme } from "~/ui/components/foundations/theming";

type CardDescriptionType = {
  isTextColor: boolean;
};

const DescriptionCard = styled.div<CardDescriptionType>`
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Luckiest Guy", cursive;
  color: ${({ isTextColor }) =>
    isTextColor
      ? baseTheme.colors.primary.black
      : baseTheme.colors.neutrals.full_white};
`;

const CardTitle = styled.h1`
  margin: 0;
  font-size: 1.4rem;
  padding: 0;
  color: white;
  width: 50%;
  text-shadow: 0 0.1em 20px rgba(0, 0, 0, 1), 0.05em -0.03em 0 rgba(0, 0, 0, 1),
    0.05em 0.005em 0 rgba(0, 0, 0, 1), 0em 0.08em 0 rgba(0, 0, 0, 1),
    0.05em 0.08em 0 rgba(0, 0, 0, 1), 0px -0.03em 0 rgba(0, 0, 0, 1),
    -0.03em -0.03em 0 rgba(0, 0, 0, 1), -0.03em 0.08em 0 rgba(0, 0, 0, 1),
    -0.03em 0 0 rgba(0, 0, 0, 1);

  span {
    transform: scale(0.8);
    display: inline-block;
  }
  span:first-child {
    animation: bop 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards infinite
      alternate;
  }
  span:last-child {
    animation: bopB 1s 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards
      infinite alternate;
  }

  @keyframes bop {
    0% {
      transform: scale(0.8);
    }
    50%,
    100% {
      transform: scale(1);
    }
  }

  @keyframes bopB {
    0% {
      transform: scale(0.9);
    }
    80%,
    100% {
      transform: scale(1) rotateZ(-3deg);
    }
  }
`;

export const Styled = {
  DescriptionCard,
  CardTitle,
};
