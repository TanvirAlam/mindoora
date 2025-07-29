import styled, { keyframes } from 'styled-components'

const SpinnerWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: calc(50% - 1.6rem);
  transform: translate(-50%, -50%);
  z-index: 9999;
`

export const Styled = {
  SpinnerWrapper
}
