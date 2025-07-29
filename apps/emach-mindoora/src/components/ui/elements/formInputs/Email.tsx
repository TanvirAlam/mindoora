import FormControl from "~/ui/components/elements/AnimatedInputField/inputField";
import type { RegisterOptions } from "react-hook-form";

type EmailProps = {
  getValue: string;
  register: (options?: RegisterOptions) => void;
  errors: { email?: { message: string } };
};

const Email = ({ getValue, register, errors }: EmailProps) => {
  return (
    <>
      <FormControl
        label="Email"
        type="text"
        getValue={getValue}
        register={register}
        validation={{
          required: "Email is required",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Please enter a valid email address",
          },
        }}
        name="email"
      />
      {errors.email && (
        <span className="text-xs text-red-600">{errors.email.message}</span>
      )}
    </>
  );
};

export default Email;
