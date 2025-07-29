import styled, { keyframes } from 'styled-components'

const stretch = keyframes`
  from {
    transform: scale(1);
  }
  to {
    transform: scale(0.4);
  }
`

const appear = keyframes`
  from {
    opacity: 0;
    visibility: hidden;
    transform: translateY(0);
  }
  to {
    opacity: 1;
    visibility: visible;
    transform: translateY(-15px);
  }
`

interface CreateButtonProps {
  delay?: number
}
export const CreateButtonStyled = styled.button<CreateButtonProps>`
  font-size: 1.5rem;
  cursor: pointer;
  border: none;
  background-color: #4d297b;
  color: #fff;
  width: 18rem;
  height: 4.35rem;
  transition: all 0.5s ease;
  transform-origin: center bottom;
  transform: scale(1);
  position: relative;
  overflow: hidden;
  outline: none;
  border-radius: 1.5rem;

  &:hover {
    background-color: #141324;
  }

  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &:after {
    background: #040404;
    border-radius: 0.3rem;
    transform: translateX(-100%);
  }

  &:focus {
    font-size: 0rem;
    height: 0.625rem;
    border-radius: 1.25rem;
    background-color: #d1d1d1;
    animation-name: ${stretch};
    animation-delay: ${(props) => (props.delay ? '25s' : '1s')};
    animation-duration: 0.5s;
    animation-fill-mode: forwards;
  }

  &:focus + .btn-open {
    animation-name: ${appear};
    animation-delay: 2s;
    animation-duration: 0.3s;
    animation-fill-mode: forwards;
  }

  ${(props) =>
    props.delay !== 0 &&
    `
    &:focus:after {
      transform: translateX(0);
      transition: transform ${props.delay}s cubic-bezier(0.445, 0.05, 0.55, 0.95);
      transition-delay: 0.4s;
    }
  `}
`
export const PlayButtonStyled = styled(CreateButtonStyled)`
  width: 100%;
  height: 2.35rem;
`
