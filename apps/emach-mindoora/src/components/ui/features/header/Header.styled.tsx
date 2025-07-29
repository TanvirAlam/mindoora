import styled from "@emotion/styled";
import { size } from "~/ui/components/foundations/breakpoints/device";

const Header = styled.div`
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0.25rem 1.875rem rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(0.475rem);
  -webkit-backdrop-filter: blur(0.475rem);
  position: fixed;
  z-index: 40;
  top: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 5rem;
  gap: 1rem;
`;

const NavBar = styled.nav`
  display: none;
  @media (min-width: ${size.lg}) {
    display: block;
  }
`;

const NavbarSubNav = styled.div`
  display: flex;
  padding-right: 10px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const IconStyle = styled.button`
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;

  span {
    position: absolute;
    width: 40px;
    height: 4px;
    background: #18ff;
    border-radius: 4px;
    transition: 0.5s;

    &:nth-child(1) {
      transform: translateY(-15px);
      width: 25px;
      left: 15px;
    }

    &:nth-child(2) {
      transform: translateY(15px);
      width: 15px;
      left: 15px;
    }
  }

  &:active span {
    background: red;
    box-shadow: 0 0 10px rgb(156, 17, 17), 0 0 20px rgb(192, 127, 127),
      0 0 30px rgb(82, 11, 11), 0 0 40px rgb(106, 12, 12);

    &:nth-child(1) {
      width: 40px;
      transform: translateY(0) rotate(45deg);
      transition-delay: 0.125s;
    }

    &:nth-child(2) {
      width: 40px;
      transform: translateY(0) rotate(315deg);
      transition-delay: 0.25s;
    }

    &:nth-child(3) {
      transform: translateX(100px);
    }
  }
`;

const Hamburger = styled.div`
  position: relative;
  padding: 0.5rem;

  .hamburgerPosition {
    left: 50px;
    top: 3rem;
    padding-right: 100px;
  }
`;

export const Styled = {
  Header,
  NavBar,
  NavbarSubNav,
  IconStyle,
  Hamburger,
};
