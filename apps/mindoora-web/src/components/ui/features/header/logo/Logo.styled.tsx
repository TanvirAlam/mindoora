import styled from "@emotion/styled";
import { size } from "~/ui/components/foundations/breakpoints/device";

const Logo = styled.div<{ isUserLoggedin?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: ${(props) => (props.isUserLoggedin ? "3rem" : "0.2rem")};
  display: none;

  @media (min-width: ${size.lg}) {
    display: block;
  }

  @keyframes stroke-offset {
    100% {
      stroke-dashoffset: -35%;
    }
  }
`;

const LogoMobile = styled.div<{ isUserLoggedin?: boolean }>`
  display: flex;
  padding-left: ${(props) => (props.isUserLoggedin ? "4rem" : "0.2rem")};
  width: 50%;

  @media (min-width: ${size.lg}) {
    display: none;
  }
`;

export const Styled = {
  Logo,
  LogoMobile,
};
