import styled from "@emotion/styled";
import { size } from "~/ui/components/foundations/breakpoints/device";

const rot_degree = "-90deg";
const rot_offset = "5%";
const rot_speed = "0.4s";
const rot_btn_blur_o = "1.25rem";
const rot_btn_blur_c = "0.625rem";
const rot_btn_blur_i = "0.125rem";
const rot_btn_greyscale_o = "60%";
const rot_btn_greyscale_c = "45%";
const rot_btn_greyscale_i = "15%";

type AvatarProps = {
  avatar: string;
  blink: boolean;
};

const Avatar = styled.a<AvatarProps>`
  width: 3rem;
  height: 3rem;

  text-decoration: none;
  color: white;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  .img {
    display: inline-block;
    width: 100%;
    height: auto;
    object-fit: cover;
  }
  &.img-rotate-button {
    width: 4rem;
    aspect-ratio: 1;
    max-width: min(5rem, 7rem);
    position: relative;
    overflow: hidden;
    border-radius: 50%;
    box-shadow: 0rem 0.313rem 10.313rem 0.188rem hsl(0, 0%, 75.3%);

    &:hover {
      .ring {
        transform: rotate(0deg);
        filter: blur(0) grayscale(0%);
      }
      box-shadow: 0.125rem 0.438rem 1.25rem 0.313rem hsl(0, 0%, 70.3%);
      scale: 1.01;
    }
    &:active {
      &:not(:focus) {
        box-shadow: 0rem 0.125rem 0.625rem 0.125rem hsl(0, 0%, 55.3%);
        scale: 0.99;
      }
    }
    &:focus {
      box-shadow: 0rem 0.125rem 0.625rem 0.125rem hsl(0, 0%, 55.3%);
      scale: 0.99;
    }
  }
  .ring {
    position: absolute;
    inset: 0;
    transition: transform ${rot_speed} ease-in-out,
      filter ${rot_speed} ease-in-out;
    content: url("${({ avatar }) => avatar}");
  }
  .ring.outer {
    z-index: 2;
    clip-path: circle(50% at center);
    transform: rotate(${rot_degree});
    filter: blur(${rot_btn_blur_o}) grayscale(${rot_btn_greyscale_o});
  }
  .ring.center {
    z-index: 3;
    clip-path: circle(calc(50% - ${rot_offset}) at center);
    transform: rotate(calc(${rot_degree} / 2));
    filter: blur(${rot_btn_blur_c}) grayscale(${rot_btn_greyscale_c});
  }
  .ring.inner {
    z-index: 4;
    clip-path: circle(calc(50% - ${rot_offset} * 2) at center);
    filter: grayscale(${rot_btn_greyscale_i});
  }
`;

const Navbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  column-gap: 2rem;
  height: 5.625rem;
  padding: 1.2rem 3rem;
  width: 100%;

  @media (max-width: 68.75rem) {
    padding: 1.2rem;
  }

  .nav-end {
    margin-left: auto;
  }

  .right-container {
    display: flex;
    align-items: center;
    column-gap: 1rem;
  }

  @media (max-width: 68.75rem) {
    .hamburger {
      display: block;
    }
  }
`;

const DesktopWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const Desktop = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  @media (max-width: ${size.md}) {
    display: none;
  }
`;

export const Styled = {
  Navbar,
  Avatar,
  DesktopWrapper,
  Desktop,
};
