import { styled } from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";

const InviteWrapper = styled.div`
  margin: 0 auto;
  width: 100%;
  background: url("assets/mindoora-short.png");
  background-repeat: no-repeat;
  background-position: cover;
  background-size: 100% 50%;

  @media (max-width: ${size.md}) {
    background-size: 100% 30%;
  }

  .column {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    .select {
      width: 100%;
      border: 1px solid #fff;
      border-radius: 1.25em;
      margin: 10px;
      font-size: 2.25rem;
      cursor: pointer;
      line-height: 1.1;
      background-image: linear-gradient(to top, #f9f9f9, #fff 33%);
      display: flex;
      justify-content: space-between;
      align-items: center;

      &::after {
        content: "";
        width: 0.8em;
        height: 0.5em;
        background-color: rgba(11, 16, 62, 0.9);
        clip-path: polygon(100% 0%, 0 0%, 50% 100%);
        padding: 10px;
      }

      &:focus + .focus {
        position: absolute;
        top: -1px;
        left: -1px;
        right: -1px;
        bottom: -1px;
        border: 2px solid var(--select-focus);
        border-radius: inherit;
      }
    }

    .info-panels {
      --color-icon: #fff;
      --color-input: #ccc;
      --color-border: #9e9e9e;
      --color-border-hover: #1a73e8;
      --all-transition: all 0.2s ease-out;
      --input-focus-opacity: 0.3;
    }

    .input-color-group-one {
      position: relative;
    }

    .input-color {
      max-width: 230px;
      min-width: 150px;
      border: 1.5px solid var(--color-border);
      border-radius: 80px;
      background: none;
      padding: 16px;
      font-size: 16px;
      transition: var(--all-transition);
    }

    .input-color:focus {
      color: var(--color-input);
      outline: none;
      border: 1.5px solid var(--color-border-hover);
    }

    .input-color:valid {
      color: var(--color-input);
      outline: none;
    }

    .input-color::-webkit-input-placeholder {
      color: var(--color-input);
    }

    .input-color::-moz-input-placeholder {
      color: var(--color-input);
    }

    .input-color::-ms-input-placeholder {
      color: var(--color-input);
    }

    .input-color:focus::-webkit-input-placeholder,
    input-color:valid::-webkit-input-placeholder {
      opacity: var(--input-focus-opacity);
    }

    .input-color:focus::-moz-input-placeholder,
    input-color:valid::-moz-input-placeholder {
      opacity: var(--input-focus-opacity);
    }

    .input-color:focus::-ms-input-placeholder,
    input-color:valid::-ms-input-placeholder {
      opacity: var(--input-focus-opacity);
    }

    .color-label {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--color-border);
      font-weight: 600;
      padding: 0 5px;
      border: 1.5px solid var(--color-border);
      border-radius: 20px;
      top: -2.5px;
      left: 25px;
      background-color: transparent;
      cursor: default;
      backdrop-filter: blur(10px);
      transition: var(--all-transition);
    }

    .input-color:focus ~ .color-label,
    input-color:valid ~ .color-label {
      color: var(--color-border-hover);
      border: 1.5px solid var(--color-border-hover);
    }

    .btn-copy {
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 24px;
      height: 24px;
      border: 1.5px solid var(--color-border);
      border-radius: 50%;
      top: -2.5px;
      right: 25px;
      background-color: transparent;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: var(--all-transition);
    }

    .btn-copy:hover {
      background-color: var(--color-border);
      transform: scale(1.2);
    }

    .btn-copy:active {
      transform: scale(1.1);
    }

    .input-color:focus ~ .btn-copy {
      border: 1.5px solid var(--color-border-hover);
    }

    .input-color:valid .input-color:focus ~ .btn-copy {
      border: 1.5px solid var(--color-border);
    }

    .input-color:focus ~ .btn-copy:hover {
      background-color: var(--color-border-hover);
    }

    #icon-btn-copy {
      fill: var(--color-border);
    }

    .btn-copy:hover #icon-btn-copy {
      fill: var(--color-icon);
    }

    .input-color:focus ~ .btn-copy #icon-btn-copy {
      fill: var(--color-border-hover);
    }

    .input-color:focus ~ .btn-copy:hover #icon-btn-copy,
    .input-color:valid ~ .btn-copy:hover #icon-btn-copy {
      fill: var(--color-icon);
    }
  }

  .column:first-child {
    margin-left: 0;
  }

  .row {
    background-color: transparent;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  @media screen and (max-width: 640px) {
    .column.full,
    .column.two-thirds,
    .column.half,
    .column.one-third,
    .column.one-fourth {
      float: none;
      margin: 0;
      width: 100%;
    }
  }
`;

const InviteCode = styled.h2`
  font-size: 60px; /* Increased font size for better visibility */
  font-weight: 700; /* Changed to semi-bold for emphasis */
  color: #fff; /* Changed text color for better contrast */
  font-family: "Roboto", sans-serif;
  background-color: #4d297b;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 20px;
`;

const InviteInstruction = styled.h4`
  font-size: 20px;
  font-weight: 500;
`;

const InviteCTA = styled.div`
  overflow: auto;
  height: 250px;
`;

const inpBorder = styled.div`
  margin: 1em 1em;
  border-radius: 50px;
  max-width: 300px;

  .input {
    text-align: center;
    padding: 15px;
    outline: none;
    border: double 0;
    background: #252525;
    border-radius: 50px;
    position: relative;
    box-sizing: border-box;
    display: block;
    width: 100%;
    font-size: 1.5rem;
  }

  .a1 {
    background: linear-gradient(
      330.28deg,
      #ff6e1d 100%,
      #ff6e1d 100%,
      #ff6e1d 100%
    );
  }

  .a1 > input {
    color: #caab98;
  }

  .a1 > input::placeholder {
    color: #ff6e1d;
    opacity: 0.6;
  }

  &:focus-within {
    background: linear-gradient(
      330.28deg,
      #2cfff2 0%,
      #1e78ff 30.73%,
      #ff54a6 55.73%,
      #ff6e1d 79.17%,
      #ff3e3e 100%
    );
  }

  &:hover {
    background: linear-gradient(
      330.28deg,
      #2cfff2 0%,
      #1e78ff 30.73%,
      #ff54a6 55.73%,
      #ff6e1d 79.17%,
      #ff3e3e 100%
    );
  }
`;

export const Styled = {
  InviteWrapper,
  InviteCode,
  InviteInstruction,
  InviteCTA,
  inpBorder,
};
