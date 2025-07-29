import styled from "@emotion/styled";
import { size } from "~/ui/components/foundations/breakpoints/device";

const Container = styled.section`
  width: 100%;
  margin: 0 auto;
  color: #000;
  border-radius: 50px;
  overflow: hidden;

  .responsive-table {
    background-color: #fefefe;
    border-collapse: collapse;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.02);
    width: 100%;
    margin: 2rem 0;
  }
  .responsive-table__row {
    display: grid;
    border-bottom: 1px solid #edeef2;
    padding: 0 1.5rem;
  }
  @media (min-width: 768px) {
    .responsive-table__row {
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    }
  }
  @media (min-width: 768px) and (max-width: 991px) {
    .responsive-table__row {
      grid-template-columns: 1fr 2fr 1fr;
    }
  }
  .responsive-table__row th,
  .responsive-table__row td {
    padding: 1rem;
  }
  .responsive-table__head {
    background-color: #4d297b;
    color: #fff;
  }
  @media (max-width: 991px) {
    .responsive-table__head {
      display: none;
    }
  }
  .responsive-table__head__title {
    display: flex;
    font-weight: 500;
    text-transform: capitalize;
    font-weight: bold;
    justify-content: center;
    font-size: 0.8rem;
  }

  .responsive-table__body__content {
    height: 420px;
    overflow: scroll;
    overflow-x: hidden;
  }

  .responsive-table__body .responsive-table__row {
    transition: 0.1s linear;
    transition-property: color, background;
  }
  .responsive-table__body .responsive-table__row:last-child {
    border-bottom: none;
  }
  .responsive-table__body .responsive-table__row:hover {
    color: #ffffff;
    background-color: #312f5a;
    cursor: pointer;
    font-weight: 800;
  }

  .responsive-table__body__text {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
  }
  .responsive-table__body__text::before {
    margin-right: 1rem;
    font-weight: 600;
    text-transform: capitalize;
  }
  @media (max-width: 991px) {
    .responsive-table__body__text::before {
      content: attr(data-title) " :";
    }
  }
  @media (max-width: 400px) {
    .responsive-table__body__text::before {
      width: 100%;
      margin-bottom: 1rem;
    }
  }

  @media (min-width: 768px) {
    .responsive-table__body__text--name::before {
      display: none;
    }
  }
  @media (min-width: 768px) and (max-width: 991px) {
    .responsive-table__body__text--name {
      grid-column: 1/2;
      flex-direction: column;
    }
  }
  @media (min-width: 768px) and (max-width: 991px) {
    .responsive-table__body__text--status,
    .responsive-table__body__text--types,
    .responsive-table__body__text--update {
      grid-column: 2/3;
    }
  }
  @media (min-width: 768px) and (max-width: 991px) {
    .responsive-table__body__text--country {
      grid-column: 3/-1;
    }
    .responsive-table__body__text--played {
      grid-column: 3/-1;
    }
  }
  @media (min-width: 768px) and (max-width: 991px) {
    .responsive-table__body__text--name,
    .responsive-table__body__text--country,
    .responsive-table__body__text--played {
      grid-row: 2;
    }
  }

  /* SVG Up Arrow Style */
  .up-arrow {
    height: 100%;
    max-height: 1.8rem;
    margin-left: 1rem;
  }

  /* SVG User Icon Style */
  .user-icon {
    width: 100%;
    max-width: 4rem;
    height: auto;
    margin-right: 1rem;
  }

  /* Status Indicator Style */
  .status-indicator {
    display: inline-block;
    width: 1.8rem;
    height: 1.8rem;
    border-radius: 50%;
    background: #222222;
    margin-right: 0.5rem;
  }
  .status-indicator--active {
    background: #25be64;
  }
  .status-indicator--inactive {
    background: #dadde4;
  }
  .status-indicator--new {
    background: #febf02;
  }
`;

export const Styled = {
  Container,
};
