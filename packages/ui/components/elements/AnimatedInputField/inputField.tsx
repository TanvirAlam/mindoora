import { Styled } from './inputField.styled'
import type { FormControlProps } from '../../../types/types'

const FormControl = ({ label, type, required, register, validation, name, getValue }: FormControlProps) => {
  console.log(getValue)
  return (
    <Styled.FormControlWrapper>
      <input
        type={type}
        required={required}
        id={name}
        name={name}
        {...register(name, validation)}
        className={getValue ? 'valid' : ''}
      />
      <label>
        {label.split('').map((char, index) => (
          <span key={index} style={{ transitionDelay: `${index * 50}ms` }}>
            {char}
          </span>
        ))}
      </label>
    </Styled.FormControlWrapper>
  )
}

export default FormControl
