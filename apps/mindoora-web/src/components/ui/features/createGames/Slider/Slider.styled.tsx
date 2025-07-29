import styled from "styled-components";

const SliderWrapper = styled.div`
  padding-bottom: 1.25rem;

  .value {
    border-bottom: 0.25rem dashed #bdc3c7;
    text-align: center;
    font-weight: bold;
    font-size: 4em;
    width: 2.375rem;
    height: 3.25rem;
    line-height: 0.75rem;
    margin: 1rem auto;
    text-shadow: white 0.125rem 0.125rem 0.125rem;
  }

  .valueHeading {
    font-weight: bold;
    font-size: 1em;

    span {
      font-size: 12px;
      color: #c0c0c0;
      text-transform: uppercase;
    }
  }

  input[type="range"] {
    display: block;
    -webkit-appearance: none;
    background-color: #bdc3c7;
    width: 9.375rem;
    height: 0.3125rem;
    border-radius: 0.3125rem;
    margin: 0 auto;
    outline: 0;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    background-color: #e74c3c;
    width: 1.875rem;
    height: 1.875rem;
    border-radius: 50%;
    border: 0.125rem solid white;
    cursor: pointer;
    transition: 0.3s ease-in-out;
  }

  input[type="range"]::-webkit-slider-thumb:hover {
    background-color: white;
    border: 0.125rem solid #e74c3c;
  }

  input[type="range"]::-webkit-slider-thumb:active {
    transform: scale(1.6);
  }
`;

export const Styled = {
  SliderWrapper,
};
