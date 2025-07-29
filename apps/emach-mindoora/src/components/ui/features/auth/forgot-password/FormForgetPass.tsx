import { useForgetPassword } from "~/utils/register/useForgetPassword";
import Email from "~/components/ui/elements/formInputs/Email";
import Button from "~/ui/components/elements/AnimatedButton/button";

const FormForgotPass = () => {
  const {
    register,
    handleSubmit,
    errors,
    getValues,
    onSubmit,
    handleLoginClick,
    state,
  } = useForgetPassword();

  return (
    <div className="flex-col-center">
      <span className="my-8 text-2xl font-medium">Forgot Password ?</span>
      <span className=" text-center text-sm text-gray-500">
        Enter your email address and we will send you an OTP to reset your
        password
      </span>
      <form className="w-full max-w-sm" onSubmit={handleSubmit(onSubmit)}>
        <Email errors={errors} register={register} getValue={getValues.email} />

        <div className=" flex-row-center my-4">
          <Button label="Send OTP" />
        </div>
      </form>
      <p className="mt-4">
        <span
          onClick={handleLoginClick}
          className="mx-1 cursor-pointer text-pink-600"
        >
          Sign in here
        </span>
      </p>
    </div>
  );
};

export default FormForgotPass;
