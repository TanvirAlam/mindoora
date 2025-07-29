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

const OTP = ({ register, getValue, errors }: Props) => {
  const [showPassword, setShowPassword] = useState("password");
  const handleTogglePassword = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setShowPassword((prev) => (prev === "password" ? "text" : "password"));
  };
  return (
    <>
      <div className="relative">
        <FormControl
          label="OTP"
          getValue={getValue}
          type={showPassword}
          register={register}
          validation={{ required: true, minLength: 4 }}
          name="otp"
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
      {errors.otp && (
        <span className="text-xs text-red-600">
          {errors.otp.type === "required" && "OTP is required"}
          {errors.otp.type === "minLength" &&
            "OTP must be at least 4 characters long"}
        </span>
      )}
    </>
  );
};
export default OTP;
