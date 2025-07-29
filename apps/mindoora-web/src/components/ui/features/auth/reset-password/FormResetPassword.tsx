import { useResetPassword } from "~/utils/register/useResetPassword";
import { useRouter } from "next/router";
import PasswordInput from "~/components/ui/elements/formInputs/Password";
import OTP from "~/components/ui/elements/formInputs/OTP";
import Button from "~/ui/components/elements/AnimatedButton/button";

const FormResetPassword = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    errors,
    email,
    handleLoginClick,
    getValues,
    onSubmit,
  } = useResetPassword();

  return (
    <div className="flex-col-center">
      <span className="my-8 text-2xl font-medium xl:-mt-0">Reset Password</span>
      <p className="text-sm text-gray-500">
        If an account exists for <span className="px-1 font-bold">{email}</span>
        , we’ll send instructions for resetting your password.
      </p>
      <p className="my-2 text-sm text-gray-500">
        Didn’t get them? Check the email address or ask to resend the
        instructions.
      </p>
      <form className="w-full max-w-sm" onSubmit={handleSubmit(onSubmit)}>
        <OTP register={register} getValue={getValues.otp} errors={errors} />
        <PasswordInput
          register={register}
          getValue={getValues.password}
          errors={errors}
        />
        <div className=" flex-row-center my-4">
          <Button label="Save" />
        </div>
      </form>
      <p
        onClick={(e: any) => {
          e.preventDefault();
          handleLoginClick();
        }}
        className="mt-4 cursor-pointer text-pink-600"
      >
        Sign in here
      </p>
    </div>
  );
};

export default FormResetPassword;
