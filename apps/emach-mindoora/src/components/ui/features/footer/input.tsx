import { Styled } from "./QuickLink.styled";
import type { FormControlProps } from "~/ui/types/types";

const FormControl = ({
  label,
  type,
  required,
  register,
  validation,
  name,
  getValue,
}: FormControlProps) => {
  return (
    <Styled.FormControlWrapper>
      <input
        type={type}
        required={required}
        id={name}
        name={name}
        {...register(name, validation)}
        className={getValue ? "valid" : ""}
      />
      <label className="pl-2">
        {label.split("").map((char, index) => (
          <span key={index} style={{ transitionDelay: `${index * 50}ms` }}>
            {char}
          </span>
        ))}
      </label>
    </Styled.FormControlWrapper>
  );
};

export default FormControl;
