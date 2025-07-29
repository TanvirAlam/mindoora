import styled, { css } from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";

const TrophyGrid = styled.div`
  position: relative;

  .container {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-auto-rows: 75px;
    position: relative;
    height: 450px;
    overflow: auto;

    a {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 2em;

      img {
        width: 100%;
        height: 100%;
        box-shadow: 0 2px 16px var(--shadow);
        -webkit-filter: grayscale(100%); /* Safari 6.0 - 9.0 */
        filter: grayscale(100%);
      }
    }
  }

  .horizontal {
    grid-column: span 2;
  }

  .vertical {
    grid-row: span 2;
  }

  .big {
    grid-column: span 2;
    grid-row: span 2;
  }

  .activeBadge {
    -webkit-filter: grayscale(0) !important; /* Safari 6.0 - 9.0 */
    filter: grayscale(0) !important;
  }
`;

export const Styled = {
  TrophyGrid,
};
