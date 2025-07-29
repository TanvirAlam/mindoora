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
};

const Avatar = styled.a<AvatarProps>`
  width: 5rem;
  height: 5rem;

  text-decoration: none;
  color: white;
  cursor: pointer;

  .img {
    display: inline-block;
    width: 5rem;
    height: auto;
    object-fit: cover;
  }
  &.img-rotate-button {
    width: 5rem;
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
      svg {
        opacity: 1;
      }
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
    filter: blur(${rot_btn_blur_i}) grayscale(${rot_btn_greyscale_i});
  }

  svg {
    opacity: 0;
  }

  @media (max-width: ${size.sm}) {
    width: 3rem;
    height: 3rem;

    .img {
      width: 3rem;
    }

    &.img-rotate-button {
      width: 3rem;
    }
  }
`;

const commonWrapper = styled.div`
  margin-top: 10px;
  min-height: 14rem;
  width: 100%;
  border-radius: 2rem;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
`;

const FindFriendsContentWrapper = styled(commonWrapper)`
  background: #dddae4;
  display: flex;
  align-items: center;
  justify-content: start;

  img {
    z-index: 1;
  }
`;

const HeroContentWrapper = styled(commonWrapper)`
  display: flex;
  background: #4d297b;
`;

const Heading = styled.h1`
  font-family: monospace;
  font-weight: bold;
  color: #7c5ca6;
  font-size: 1.2rem;
  width: 80%;
`;

const FindFriends = styled.button`
  width: 130px;
  height: 40px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  background-color: #f9d421;
  color: #000;
  border: none;
  border-radius: 5px;
  transition: all 0.4s;

  &:hover {
    border-radius: 5px;
    transform: translateY(-10px);
    box-shadow: 0 7px 0 -2px #f85959, 0 15px 0 -4px #39a2db,
      0 16px 10px -3px #39a2db;
  }

  &:active {
    transition: all 0.2s;
    transform: translateY(-5px);
    box-shadow: 0 2px 0 -2px #f85959, 0 8px 0 -4px #39a2db,
      0 12px 10px -3px #39a2db;
  }
`;

export const Styled = {
  HeroContentWrapper,
  FindFriendsContentWrapper,
  Heading,
  FindFriends,
  Avatar,
};
