import styled from "styled-components";
import ProgressBar from "@ramonak/react-progress-bar";
import { size } from "~/ui/components/foundations/breakpoints/device";

const Avatar = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  color: #fff;
`;

const Grad = styled.div`
  height: inherit;
  width: inherit;
  position: absolute;
  animation-duration: 1s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
`;

const AvatarImg = styled.img`
  width: 30px;
  position: absolute;
  overflow: hidden;
  z-index: 10;
`;

const LiveMarker = styled.div`
  position: absolute;
  z-index: 10;
  height: 60px;
  width: 70px;
  text-transform: uppercase;
  border-radius: 15%/25%;
  line-height: 16px;
  text-align: center;
  font-family: sans-serif;
  font-size: 8px;
  padding-top: 1px;
  top: 30px;
  text-shadow: 1px 0 0 rgba(0, 0, 0, 0.4);
  font-weight: bold;
  display: flex;
  flex-direction: column;
  padding: 2px;

  span {
    position: relative;
    font-family: system-ui;
    font-size: 1.2rem;
    padding-top: 5px;
    display: flex;
    justify-content: center;
  }

  @media (max-width: ${size.md}) {
    span {
      font-size: 1.5rem;
    }
    text {
      font-size: 0.8rem;
    }
  }
`;

const LiveMarkerName = styled.h1`
  background: blue;
  font-weight: bold;
  width: 100%;
  height: 30%;
  border-radius: 20%;
  position: relative;
  top: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Link = styled.a`
  text-decoration: none;

  &:hover {
    cursor: pointer;
  }
`;

const LiveProgressBar = styled(ProgressBar)`
  position: relative;
  padding-top: 84px;
  right: 23px;
  font-size: 0.2rem;
`;

export const Styled = {
  Avatar,
  Grad,
  AvatarImg,
  LiveMarker,
  LiveMarkerName,
  LiveProgressBar,
  Link,
};
