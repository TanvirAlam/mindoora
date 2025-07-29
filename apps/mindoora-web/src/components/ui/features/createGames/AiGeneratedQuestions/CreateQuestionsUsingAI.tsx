import { AiModalWrapper } from "~/styles/mixins.styled";
import { AiTabs } from "./AiQuestionsTabs";

export const CreateQuestionsUsingAI = () => {
  return (
    <AiModalWrapper className="items-start">
      <AiTabs />
    </AiModalWrapper>
  );
};
