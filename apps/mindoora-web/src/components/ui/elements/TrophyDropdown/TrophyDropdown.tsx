import { Dropdown } from "semantic-ui-react";

import { useRecoilState } from "recoil";
import { questionRecoilState } from "~/utils/atom/gameQuestion.atom";

import { Trophies } from "./Trophies";

const TrophiesDropdown = ({ index }: { index: number }) => {
  const [questionState, setQuestionState] = useRecoilState(questionRecoilState);
  const thisQuestion = questionState[index];

  const handleTrophyChange = (e: any, d: any) => {
    const value = d.value;
    setQuestionState((prevState) => {
      const updatedQuestions = [...prevState];
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        qTrophy: value,
      };
      return updatedQuestions;
    });
  };

  return (
    <div className="right-[4rem] pt-2">
      <Dropdown
        placeholder={thisQuestion?.qTrophy}
        fluid
        selection
        options={Trophies}
        onChange={(e, d) => handleTrophyChange(e, d)}
      />
    </div>
  );
};

export default TrophiesDropdown;
