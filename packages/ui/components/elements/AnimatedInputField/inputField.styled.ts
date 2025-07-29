import styled from '@emotion/styled'

const FormControlWrapper = styled.div`
  position: relative;
  margin: 20px 0 40px;
  width: 100%;

  input {
    background-color: transparent;
    border: 0;
    border-bottom: 2px #000 solid;
    display: block;
    width: 100%;
    padding: 15px 0;
    font-size: 18px;
    color: #000;
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
    color: #000;
    transition: 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  input:focus + label span,
  input.valid + label span {
    color: rgb(124 58 237);
    transform: translateY(-30px);
  }
`
export const Styled = {
  FormControlWrapper
}
