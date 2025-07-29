import React, { useState } from "react";
import type { ReactNode } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FormControl from "~/ui/components/elements/AnimatedInputField/inputField";

type Props = {
  register: ReactNode;
  getValue: string;
  errors: () => void;
};

const PasswordInput = ({ register, getValue, errors }: Props) => {
  const [showPassword, setShowPassword] = useState("password");
  const handleTogglePassword = (e: any) => {
    e.preventDefault();
    setShowPassword((prev) => (prev === "password" ? "text" : "password"));
  };
  return (
    <>
      <div className="relative">
        <FormControl
          label="Password"
          getValue={getValue}
          type={showPassword}
          register={register}
          validation={{ required: true, minLength: 6 }}
          name="password"
        />
        <button
          className="absolute right-5 top-1/2 -translate-y-1/2 transform"
          onClick={handleTogglePassword}
        >
          {showPassword === "password" ? (
            <VisibilityOffIcon />
          ) : (
            <VisibilityIcon />
          )}
        </button>
      </div>
      {errors.password && (
        <span className="text-xs text-red-600">
          {errors?.password.type === "required" && "Password is required"}
          {errors.password.type === "minLength" &&
            "Password must be at least 6 characters long"}
        </span>
      )}
    </>
  );
};
export default PasswordInput;
