import { styled } from "styled-components";

const SVGImage = styled.img`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
`;

const ShareButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 25px 20px 22px;
  box-shadow: rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
  background-color: #e8e8e8;
  border-color: #683d97;
  border-style: solid;
  border-width: 9px;
  border-radius: 35px;
  font-size: 25px;
  font-weight: 900;
  color: rgb(134, 124, 124);
  font-family: monospace;
  transition: transform 400ms cubic-bezier(0.68, -0.55, 0.27, 2.5),
    border-color 400ms ease-in-out, background-color 400ms ease-in-out;
  word-spacing: -2px;

  @keyframes movingBorders {
    0% {
      border-color: #fce4e4;
    }

    50% {
      border-color: #ffd8d8;
    }

    90% {
      border-color: #fce4e4;
    }
  }

  &:hover {
    background-color: #eee;
    transform: scale(100%);
    animation: movingBorders 3s infinite;
  }

  & svg {
    margin-right: 11px;
    fill: rgb(255, 110, 110);
    transition: opacity 100ms ease-in-out;
  }

  .filled {
    position: absolute;
    opacity: 0;
    top: 0px;
  }

  @keyframes beatingHeart {
    0% {
      transform: scale(1);
    }

    15% {
      transform: scale(1.15);
    }

    30% {
      transform: scale(1);
    }

    45% {
      transform: scale(1.15);
    }

    60% {
      transform: scale(1);
    }
  }

  &:hover .empty {
    opacity: 0;
  }

  &:hover .filled {
    opacity: 1;
    animation: beatingHeart 1.2s infinite;
  }
`;

export const Styled = {
  ShareButton,
  SVGImage,
};
