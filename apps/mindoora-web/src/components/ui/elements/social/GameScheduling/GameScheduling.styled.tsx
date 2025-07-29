import styled from "@emotion/styled";
import { baseTheme } from "~/ui/components/foundations/theming";

const GameSchadulingWrapper = styled.div`
  position: relative;

  .block {
    position: relative;
  }

  .cal {
    border: 3px solid #e5e6e7;
    border-radius: 100%;
    width: 80px;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .month {
    font-size: 0.8rem;
    font-weight: bold;
    text-transform: uppercase;
  }
  .day {
    font-size: 1rem;
    font-weight: 800;
  }
  .year {
    font-size: 1rem;
    font-weight: 800;
  }
  .timer {
    width: 30px;
    height: 30px;
    position: absolute;
    bottom: 30%;
    right: -10px;
    border: 2px solid #323a44;
    background: white;
    border-radius: 50%;
    transform: rotate(-90deg);
  }
  .timer .timer__item {
    position: absolute;
    top: 50%;
    left: 50%;
    background: #323a44;
    border-radius: 10px;
  }
  .timer .timer__item.sec {
    width: 40%;
    height: 2.6666666667px;
    margin-top: -1.3333333333px;
    margin-left: -1.3333333333px;
    transform-origin: 1.3333333333px 1.3333333333px;
    background: #e74c3c;
  }
  .timer .timer__item.min {
    width: 40%;
    height: 4px;
    margin-top: -2px;
    margin-left: -4px;
    transform-origin: 4px 4px;
  }
  .timer .timer__item.hour {
    width: 25%;
    height: 4px;
    margin-top: -2px;
    margin-left: -4px;
    transform-origin: 4px 4px;
  }
  .message {
    margin-top: 40px;
    font-size: 20px;
    text-align: center;
    line-height: 2em;
  }
  .message .label {
    background: #0099ff;
    font-weight: bold;
    padding: 4px 8px 6px;
    border-radius: 70px;
  }
  .message .label.type {
    background: #65ab09;
  }
  .message .label.month {
    text-transform: uppercase;
  }
`;

export const Styled = {
  GameSchadulingWrapper,
};
