import styled from "@emotion/styled";
import { Swiper } from "swiper/react";

const CustomSwiper = styled(Swiper)`
  .swiper-wrapper {
    -webkit-transition-timing-function: linear !important;
    -o-transition-timing-function: linear !important;
    transition-timing-function: linear !important;
  }
`;

export const Styled = {
  CustomSwiper,
};
