import { Styled } from './button.styled'

const Button = ({ label }: { label: string }) => {
  return <Styled.Button>{label}</Styled.Button>
}

export default Button
