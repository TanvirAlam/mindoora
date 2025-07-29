import styled from '@emotion/styled'

const Checkbox = styled.label`
  display: flex;
  align-items: baseline;
  cursor: pointer;

  input[type='checkbox'] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .checkmark {
    position: relative;
    display: inline-block;
    width: 1.2rem;
    height: 1.2rem;
    margin-right: 0.8rem;
    border: 1px solid #aaa;
    background-color: #fff;
    border-radius: 0.3rem;
    transition: all 0.3s;
  }

  input[type='checkbox']:checked ~ .checkmark {
    background-color: rgb(124 58 237);
  }

  input[type='checkbox']:checked ~ .checkmark:after {
    content: '';
    position: absolute;
    top: 0.1rem;
    left: 0.4rem;
    width: 0.25rem;
    height: 0.7rem;
    border: solid white;
    border-width: 0 0.15rem 0.15rem 0;
    transform: rotate(45deg);
  }

  input[type='checkbox']:focus ~ .checkmark {
    box-shadow: 0 0 0 0.15rem #dfec5065;
  }

  &:hover input[type='checkbox'] ~ .checkmark {
    border-color: #c3cf34;
  }

  input[type='checkbox']:disabled ~ .checkmark {
    opacity: 0.5;
    cursor: not-allowed;
  }

  input[type='checkbox']:disabled ~ .checkmark:hover {
    border-color: #4d4d4d;
  }
`

export const Styled = { Checkbox }
