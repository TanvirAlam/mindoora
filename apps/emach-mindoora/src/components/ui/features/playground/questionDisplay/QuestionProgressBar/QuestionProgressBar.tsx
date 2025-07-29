import { Styled } from "./QuestionProgressBar.styled";

export const QuestionProgressBar = ({ progress }: { progress: number }) => {
  return (
    <Styled.Container>
      <Styled.QuestionProgressBar
        completed={progress}
        bgColor={"Gold"}
        labelColor={"Black"}
      />
    </Styled.Container>
  );
};
