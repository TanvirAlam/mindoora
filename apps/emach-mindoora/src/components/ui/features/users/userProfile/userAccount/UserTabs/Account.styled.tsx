import styled from "@emotion/styled";
import { size } from "~/ui/components/foundations/breakpoints/device";

const PricingCard = styled.div`
  width: 100%;
  min-height: 300px;
  height: auto;
  border-radius: 10px;
  padding: 10px;
  display: flex;
  flex-direction: column;

  .card-header {
    width: 100%;
    height: 60px;
    padding: 10px;
    border: 1px solid #ededed;
    border-radius: 10px;

    .card-btn-parent {
      width: 100%;
      height: 100%;
      display: flex;
      position: relative;

      button {
        width: calc(100% / 3);
        height: 100%;
        border: 0;
        border-radius: 7px;
        background-color: transparent;
        cursor: pointer;
        z-index: 1;
        font-weight: 500;
        transition: color 0.5s ease;
        &:nth-of-type(1).active,
        &:nth-of-type(1).active ~ div {
          left: 0px;
          color: #fff;
        }
        &:nth-of-type(2).active,
        &:nth-of-type(2).active ~ div {
          left: calc(100% / 3);
          color: #fff;
        }
        &:nth-of-type(3).active,
        &:nth-of-type(3).active ~ div {
          left: calc(calc(100% / 3) * 2);
          color: #fff;
        }
      }

      div {
        position: absolute;
        top: 0;
        left: 0;
        width: calc(100% / 3);
        height: 100%;
        background: #45a69a;
        border-radius: 7px;
        transition: left 0.5s ease;
      }
    }
  }
  .card-body {
    display: flex;
    width: 100%;
    padding: 10px 20px;

    > div {
      width: 100%;
      height: auto;
      display: none;
      .card-plans {
        width: 100%;
        display: flex;
        flex-direction: column;
        row-gap: 5px;
        span {
          color: gray;
          font-weight: 500;
          font-size: 13px;
          letter-spacing: 0.5px;
        }
        div {
          display: flex;
          justify-content: space-between;
          h3 {
            font-size: 24px;
          }
        }
      }
      .card-content {
        margin-top: 25px;
        > p {
          line-height: 20px;
          font-size: 14px;
          font-weight: 400;
        }
        .card-lists {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          row-gap: 10px;
          .card-list {
            display: flex;
            column-gap: 10px;
            font-size: 14px;
            img {
              width: 15px;
            }
          }
        }
      }
      .card-button {
        margin-top: 35px;
        button {
          border: 0;
          width: 100%;
          height: 40px;
          border-radius: 20px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.286);
          letter-spacing: 0.5px;
          font-weight: 500;
        }
      }
      &.active {
        display: block;
      }
    }
  }

  @media screen and (max-width: 400px) {
    .pricing-card {
      width: 320px;
      padding: 25px;
    }
  }
`;

export const Styled = {
  PricingCard,
};
