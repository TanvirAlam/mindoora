import styled from "@emotion/styled";

const FormControlWrapper = styled.div`
  position: relative;
  margin: 20px 0 40px;
  width: 100%;

  input {
    background-color: #4d297b;
    border-bottom: 2px #9f9bd1 solid;
    display: block;
    width: 100%;
    padding: 15px 0;
    font-size: 18px;
    color: #fff;
  }

  input:focus,
  input.valid {
    outline: 0;
    border-bottom-color: rgb(124 58 237);
  }

  label {
    position: absolute;
    top: 15px;
    left: 0;
    pointer-events: none;
  }

  label span {
    display: inline-block;
    font-size: 18px;
    min-width: 5px;
    color: #fff;
    transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  input:focus + label span,
  input.valid + label span {
    color: #fff;
    transform: translateY(-30px);
  }
`;

const CustomLink = styled.a`
  display: inline-flex;
  flex-direction: row;
  font-size: 0.875rem;
  position: relative;
  text-decoration: none;
  color: #fff;
  overflow: hidden;

  &:before {
    content: "";
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 1.5px;
    background: #fff;
    transform: translateX(-101%);
    transition: transform 0.5s ease;
  }

  &:hover:before {
    transform: translateX(0);
  }
`;

const SocialIconsContainer = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    position: relative;
    display: inline-block;
    margin: 8px;
  }

  i {
    color: #fff;
    font-size: 20px;
    line-height: normal;
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 10;
    transform-origin: top left;
    transform: scale(1) translateX(-50%) translateY(-50%);
    -ms-transform: scale(1) translateX(-50%) translateY(-50%);
    -webkit-transform: scale(1) translateX(-50%) translateY(-50%);
    transition: all 0.25s ease-out;
  }

  a {
    display: inline-block;
    position: relative;
    &:before {
      content: " ";
      display: block;
      width: 3rem;
      height: 3rem;
      border-radius: 100%;
      background: linear-gradient(45deg, #b2a2c9, #7f5ca5);
      transition: all 0.25s ease-out;
    }

    &:hover:before {
      transform: scale(0);
      -ms-transform: scale(0);
      -webkit-transform: scale(0);
      transition: all 0.25s ease-in;
    }

    &:hover i {
      color: #fff;
      transform-origin: top left;
      transform: scale(2) translateX(-50%) translateY(-50%);
      -ms-transform: scale(2) translateX(-50%) translateY(-50%);
      -webkit-transform: scale(2) translateX(-50%) translateY(-50%);
      background: -webkit-linear-gradient(45deg, #00b5f5, #002a8f);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      transition: all 0.25s ease-in;
    }

    @media (max-width: 768px) {
      i {
        font-size: 20px;
      }

      li {
        margin: 6px;
      }
    }
  }
`;

export const Styled = {
  FormControlWrapper,
  CustomLink,
  SocialIconsContainer,
};
