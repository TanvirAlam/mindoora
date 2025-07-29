import { gamePlayRecoilState } from "~/utils/atom/gamePlay.atom";
import { ModalWrapper } from "~/styles/mixins.styled";
import FeedbackGame from "../feedback/FeedbackGame";
import { Styled } from "./ThankYou.styled";
import { useRecoilState } from "recoil";

export const ThankYou = () => {
  const [gamePlay] = useRecoilState(gamePlayRecoilState);
  return (
    <ModalWrapper>
      <Styled.Wrapper1>
        <Styled.Wrapper2>
          <h1>Thank you !</h1>
        </Styled.Wrapper2>
        <Styled.Feedback>
          <FeedbackGame playerId={gamePlay.playerId} gameId={gamePlay.gameId} />
        </Styled.Feedback>
      </Styled.Wrapper1>
    </ModalWrapper>
  );
};
