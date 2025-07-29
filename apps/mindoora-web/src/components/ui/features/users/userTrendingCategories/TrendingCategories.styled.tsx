import styled from "@emotion/styled";
import Link from "next/link";
import { size } from "~/ui/components/foundations/breakpoints/device";

const CategoryWrapper = styled(Link)`
  position: relative;
  font-size: 1rem;
  text-decoration: none;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.5);
  cursure: auto;

  @media (max-width: ${size.md}) {
    color: #683d96;
  }

  span {
    display: flex;
  }

  &:hover {
    img {
      scale: 2;
      transition: 1s;
    }

    span {
      font-weight: bold;
      transition: 1s;
    }
  }
`;

export const Styled = {
  CategoryWrapper,
};
