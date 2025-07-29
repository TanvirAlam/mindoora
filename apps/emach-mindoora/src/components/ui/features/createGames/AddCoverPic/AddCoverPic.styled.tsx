import styled from "styled-components";

const Picture = styled.label`
  color: #aaa;
  cursor: pointer;
  font-family: sans-serif;
  transition: color 300ms ease-in-out, background 300ms ease-in-out;
  outline: none;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    color: #777;
  }

  &:active {
    border-color: turquoise;
    color: turquoise;
  }

  &:focus {
    color: #777;
    background: #ccc;
  }
`;

const PictureWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  img {
    border-radius: 40px;
    width: 350px;
  }
`;

export const Styled = {
  PictureWrapper,
  Picture,
};
