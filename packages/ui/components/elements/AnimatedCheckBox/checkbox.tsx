import type { CheckBoxProps } from '../../../types/types'
import { Styled } from './checkbox.styled'

const Checkbox = ({ label, required }: CheckBoxProps) => {
  return (
    <Styled.Checkbox>
      <input type='checkbox' required={required} />
      <span className='checkmark'></span>
      {label}
    </Styled.Checkbox>
  )
}

export default Checkbox
