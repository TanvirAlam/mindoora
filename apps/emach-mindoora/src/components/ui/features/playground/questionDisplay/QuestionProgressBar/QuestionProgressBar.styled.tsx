import { styled } from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";
import ProgressBar from "@ramonak/react-progress-bar";

const Container = styled.div`
  width: 100%;
  margin: 0px auto;
  text-align: center;
  position: relative;
  padding-left: 40px;
  padding-right: 40px;
`;

const QuestionProgressBar = styled(ProgressBar)``;

export const Styled = {
  Container,
  QuestionProgressBar,
};
