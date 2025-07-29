import { Styled } from "./AddQuestions.styled";
import { QuestionCreationHub } from "./QuestionCreationHub/QuestionCreationHub";
import { QuestionOverviews } from "./QuestionOverviews";
import { CreateButtonStyled } from "~/ui/components/elements/CreateButton/CreateButtonStyled";
import { useRecoilState } from "recoil";
import { questionRecoilState } from "~/utils/atom/gameQuestion.atom";

const AddQuestions = ({ onTabChange }: { onTabChange: any }) => {
  const [questionState, setQuestionState] = useRecoilState(questionRecoilState);
  return (
    <>
      <Styled.AddQuestionWrapper>
        <div className="layout">
          <div className="col col-main">
            <QuestionCreationHub />
          </div>
          <div className="col col-complementary" role="complementary">
            <QuestionOverviews onTabChange={onTabChange} />
          </div>
        </div>
      </Styled.AddQuestionWrapper>
      {questionState.length !== 0 && (
        <div className="flex h-[60px] items-center justify-center bg-white pt-4">
          <CreateButtonStyled onClick={onTabChange}>
            <div className="flex items-center justify-center gap-2 font-bold text-white">
              <img src="/assets/q-icon.png" alt="" width="40" height="40" />
              Continue...
            </div>
          </CreateButtonStyled>
        </div>
      )}
    </>
  );
};

export default AddQuestions;
