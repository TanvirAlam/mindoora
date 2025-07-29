import { styled } from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";

const GameName = styled.div`
  position: relative;
  font-size: 1.5rem;
  padding: 1rem;
  text-transform: capitalize;
`;

const GameCategory = styled.div`
  position: relative;
  font-size: 1rem;
  text-transform: capitalize;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 10px;
  font-weight: 800;
`;

const Line = styled.hr`
  width: calc(100% - 40px);
  margin-right: 2vw;
  margin: 10px;
  height: 0;
  border: 0.1rem solid #c0c0c0c;
  display: inline-block;
`;

const GameAuther = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: 100%;
  padding: 1rem;
`;

const GameDescription = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  label {
    font-weight: 800;
  }
`;

const FollowingButton = styled.button`
  color: #6756e8;
  font-family: "Helvetica";
  font-size: 10pt;
  background-color: #ffffff;
  border: 1px solid;
  border-color: #6756e8;
  border-radius: 0.5rem;
  width: 85px;
  height: 30px;
  cursor: hand;
`;

const QuestionWrapper = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 1.5rem;
    font-weight: 800;
  }
`;

const GameQuestions = styled.div``;

export const Styled = {
  GameName,
  GameCategory,
  Line,
  GameAuther,
  GameDescription,
  FollowingButton,
  QuestionWrapper,
  GameQuestions,
};
