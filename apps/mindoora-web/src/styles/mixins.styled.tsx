import styled from "styled-components";
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

export const BoxShadow = () => `
  box-shadow: -0.0625rem -0.0625rem 0.125rem rgba(255, 255, 255, 0.25),
      inset 0.125rem 0.125rem 0.3125rem rgba(255, 255, 255, 0.25),
      0.5rem 1.875rem 1.875rem rgba(0, 0, 0, 0.4), inset -0.125rem -0.125rem 0.3125rem rgba(0, 0, 0, 0.4);
`;

export const ModalWrapper = styled.div`
  width: clamp(21.875rem, 50vw, 80vw);
  padding: clamp(0.675rem, 1.5vw, 2rem);
  border-radius: 0.675rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  background-color: #fff;
`;

export const InviteModalWrapper = styled(ModalWrapper)`
  width: clamp(27.875rem, 50vw, 80vw);
`;

export const AiModalWrapper = styled(ModalWrapper)`
  width: clamp(24.875rem, 50vw, 80vw);
  align-items: start;
`;

export const UserGameModalWrapper = styled(ModalWrapper)`
  width: clamp(24.875rem, 50vw, 80vw);
  align-items: start;
  background-color: #7c59a4;
`;

export const CustomModalWrapper = styled(AiModalWrapper)`
  display: block;
`;

export const AboutUsModalWrapper = styled(ModalWrapper)`
  width: clamp(24.875rem, 80vw, 80vw);
  display: block;
`;

export const FeedbackModalWrapper = styled(ModalWrapper)`
  width: clamp(30rem, 80vw, 80vw);
  background-image: url("/assets/feedback.png");
  background-attachment: fixed;
  background-repeat: no-repeat;
  background-size: auto;
  background-position: center;
`;

export const CustomQuestionTabTitle = styled.h4`
  font-size: 28px;
  color: royalblue;
  font-weight: 600;
  letter-spacing: -1px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: ${size.sm}) {
    font-size: 20px;
    padding-bottom: 20px;
  }
`;

type AvatarProps = {
  avatar: string;
};

export const Avatar = styled.a<AvatarProps>`
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
    width: 4rem;
    height: 4rem;

    .img {
      width: 4rem;
    }

    &.img-rotate-button {
      width: 4rem;
    }
  }
`;
