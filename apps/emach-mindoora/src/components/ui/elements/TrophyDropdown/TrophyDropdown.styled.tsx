import styled from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";
import { BoxShadow } from "~/styles/mixins.styled";

const TrophyDropdownWrapper = styled.div`
  position: absolute;
  left: 0;

  .f-dropdown {
    --max-scroll: 3;
    position: absolute;
    z-index: 10;
    width: 400px;

    select {
      display: none;
    }
    & > span {
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      position: relative;
      color: #bbb;
      border: 1px solid #ccc;
      background: #fff;
      transition: color 0.2s ease, border-color 0.2s ease;
      > span {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        padding-right: 12px;
      }
      img {
        width: 30px;
        margin-right: 10px;
      }
      &:before,
      &:after {
        content: "";
        display: block;
        position: absolute;
        width: 8px;
        height: 2px;
        border-radius: 1px;
        top: 50%;
        right: 12px;
        background: #000;
        transition: all 0.3s ease;
      }
      &:before {
        margin-right: 4px;
        transform: scale(0.96, 0.8) rotate(50deg);
      }
      &:after {
        transform: scale(0.96, 0.8) rotate(-50deg);
      }
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      opacity: 0;
      visibility: hidden;
      position: absolute;
      max-height: calc(var(--max-scroll) * 46px);
      top: 40px;
      left: 0;
      z-index: 1;
      right: 0;
      background: #fff;
      border: 1px solid #ccc;
      border-radius: 6px;
      overflow-x: hidden;
      overflow-y: auto;
      transform-origin: 0 0;
      transition: opacity 0.2s ease, visibility 0.2s ease,
        transform 0.3s cubic-bezier(0.4, 0.6, 0.5, 1.32);
      transform: translate(0, 5px);
      li {
        padding: 0;
        margin: 0;
        a {
          cursor: pointer;
          display: block;
          padding: 8px 12px;
          color: #000;
          text-decoration: none;
          outline: none;
          position: relative;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          img {
            width: 30px;
            margin-right: 10px;
          }
          &:hover {
            color: #5c6bc0;
          }
        }
        &.active {
          a {
            color: #fff;
            background: #303f9f;
            &:before,
            &:after {
              --scale: 0.6;
              content: "";
              display: block;
              width: 10px;
              height: 2px;
              position: absolute;
              right: 12px;
              top: 50%;
              opacity: 0;
              background: #fff;
              transition: all 0.2s ease;
            }
            &:before {
              transform: rotate(45deg) scale(var(--scale));
            }
            &:after {
              transform: rotate(-45deg) scale(var(--scale));
            }
            &:hover {
              &:before,
              &:after {
                --scale: 0.9;
                opacity: 1;
              }
            }
          }
        }
        &:first-child {
          a {
            border-radius: 6px 6px 0 0;
          }
        }
        &:last-child {
          a {
            border-radius: 0 0 6px 6px;
          }
        }
      }
    }
    &.disabled {
      opacity: 0.7;
      > span {
        cursor: not-allowed;
      }
    }
    &.filled {
      & > span {
        color: #000;
      }
    }
    &.open {
      z-index: 15;
      & > span {
        border-color: #aaa;
        &:before,
        &:after {
          background: #000;
        }
        &:before {
          transform: scale(0.96, 0.8) rotate(-50deg);
        }
        &:after {
          transform: scale(0.96, 0.8) rotate(50deg);
        }
      }
      ul {
        opacity: 1;
        visibility: visible;
        transform: translate(0, 12px);
        transition: opacity 0.3s ease, visibility 0.3s ease,
          transform 0.3s cubic-bezier(0.4, 0.6, 0.5, 1.32);
      }
    }
  }

  /* --------------------------- */

  .f-group {
    max-width: 250px;
    margin: 0 auto;
    text-align: left;
    select {
      width: 100%;
    }
  }

  .f-control {
    font-size: 14px;
    line-height: normal;
    color: #000;
    display: inline-block;
    background-color: #ffffff;
    border: #ccc 1px solid;
    border-radius: 6px;
    padding: 8px 12px;
    outline: none;
    max-width: 250px;
  }

  label {
    width: 100%;
    display: block;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
  }
`;

export const Styled = {
  TrophyDropdownWrapper,
};
