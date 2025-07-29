import styled from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";
import { BoxShadow } from "~/styles/mixins.styled";

const QuestionHubWrapper = styled.ul`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 23px;
  padding: 20px;

  @media (max-width: ${size.md}) {
    flex-direction: coloum;
  }

  li {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;

    &:before {
      content: "";
      display: block;
      border-top: 1px solid #ddd;
      border-bottom: 1px solid #fff;
      width: 100%;
      height: 1px;
      position: absolute;
      top: 50%;
      z-index: -1;
    }

    a {
      display: flex !important;
      justify-content: center !important;
      align-items: center !important;
      flex-direction: row !important;
      gap: 23px;
      width: 50rem;
    }

    a:link,
    a:visited {
      display: block;
      text-decoration: none;
      color: #a7a7a7;
      height: 150px;
      position: relative;
      text-align: center;
      line-height: 144px;
      box-shadow: 0px 3px 8px #aaa, inset 0px 2px 3px #fff;
      border: solid 1px transparent;

      @media (max-width: ${size.md}) {
        width: 20rem;
        height: 70px;

        img {
          width: 50px;
          height: 50px;
        }
      }
    }

    a:before {
      content: "";
      display: block;
      background: #fff;
      border-top: 2px solid #ddd;
      position: absolute;
      top: -18px;
      left: -18px;
      bottom: -18px;
      right: -18px;
      z-index: -1;
      border-radius: 50%;
      box-shadow: inset 0px 8px 48px #ddd;
    }

    a:active {
      box-shadow: 0px 3px 4px #aaa inset, 0px 2px 3px #fff;
    }
  }

  .disabled-link {
    cursor: default;
    pointer-events: none;
    text-decoration: none;
    color: grey;
  }
`;

const SubTitle = styled.div`
  text-align: center;
  font-weight: bold;
  font-size: 30px;
  padding: 10px 0;
  border-bottom: 2px solid #4d297b;
  margin: auto; 
`;

export const Styled = {
  QuestionHubWrapper,
  SubTitle,
};
