import { styled } from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";

const ImgBox = styled.div`
  position: absolute;
  left: 50%;
  top: -50px;
  transform: translateX(-50%);
  width: 100px;
  height: 100px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  transition: 0.5s;
  z-index: 1;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const GameCardContent = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 4rem;
`;

const GameDetails = styled.div`
  width: 100%;
`;

const DetailData = styled.div`
  color: black;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-bottom: 5px;
  z-index: 0;

  .game-features {
    margin-top: 1rem;
    width: 100%;
    padding: 0.5rem;
  }

  .game-features .feature {
    font-size: 14px;
    margin: 0.5rem 0;
    color: #b3b3b3;
    box-shadow: 9px 9px 16px rgba(163, 177, 198, 0.6),
      -9px -9px 16px rgba(255, 255, 255, 0.6);
    padding: 5px;
    border-radius: 20px;
    display: flex;
    justify-content: space-between;
  }

  .game-features .feature span {
    display: flex;
    float: right;
    color: #3b3b3b;
    font-weight: 800;
    font-size: 0.7rem;
    white-space: nowrap;
    justify-content: center;
    align-items: center;
  }
`;

const GameCard = styled.div`
  position: relative;
  margin-top: 50px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.15);
  transition: 0.5s;
  margin-left: 2rem;
  color: #000;
  display: flex;
  margin-left: 1rem;
  margin-right: 2rem;
`;

const GameName = styled.h2`
  font-size: 0.9em;
  font-weight: 600;
  color: #4d297b;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${size.sm}) {
    font-size: 0.8em;
  }
`;

const GameActions = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
`;

export const Styled = {
  GameCard,
  ImgBox,
  GameCardContent,
  GameDetails,
  GameName,
  GameActions,
  DetailData,
};
