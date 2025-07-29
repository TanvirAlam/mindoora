import styled from "@emotion/styled";
import { baseTheme } from "~/ui/components/foundations/theming";

const TimeMain = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 50px;

  .meridianLabel {
    font-size: 40px;
    text-align: center;
    color: #6e48ea;
  }

  .meridianLabelDate {
    font-size: 20px;
    color: #6e48ea;
  }

  .timeBox {
    position: relative;
    border-radius: 15px;
    background-color: #6e48ea;
    overflow: hidden;
    height: 60px;
    width: 300px;
    margin: auto;
  }

  .dottedLine {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 0;
    border-left: 3px dashed #fff;
    z-index: 2000;
  }

  .timeScaleGroup {
    position: absolute;
    height: 100%;
    bottom: 0;
  }
`;

export const Styled = {
  TimeMain,
};
