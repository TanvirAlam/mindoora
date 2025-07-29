import { useRouter } from "next/router";
import FormControl from "~/ui/components/elements/AnimatedInputField/inputField";
import CheckBox from "~/ui/components/elements/AnimatedCheckBox/checkbox";
import Button from "~/ui/components/elements/AnimatedButton/button";
import PasswordInput from "../../../elements/formInputs/Password";
import Image from "next/image";
import GoogleRecapcha from "../../GoogleRecapcha";
import { useRegister } from "~/utils/register/useRegister";
import SocialLoginButton from "../socialLogin/SocialLoginButton";
import Email from "~/components/ui/elements/formInputs/Email";
import { useSession } from "next-auth/react";

const FormRegister = () => {
  const router = useRouter();
  const {
    register,
    errors,
    onSubmit,
    getValues,
    captchaRef,
    handleLoginClick,
    state,
  } = useRegister();
  const { data: session } = useSession();

  return (
    <div className="flex-col-center">
      <div className="relative h-8 w-full">
        <Image
          fill
          src={"/mindoora.png"}
          alt="welcome"
          className="object-contain"
        />
      </div>
      <form className=" w-full max-w-sm lg:mt-10" onSubmit={onSubmit}>
        <FormControl
          label="Name"
          type="text"
          register={register}
          getValue={getValues.name}
          validation={{ required: "Name is required" }}
          name="name"
        />
        {errors.name && (
          <span className="text-xs text-red-600">Name is required</span>
        )}
        <Email errors={errors} register={register} getValue={getValues.email} />
        <PasswordInput
          register={register}
          getValue={getValues.password}
          errors={errors}
        />
        <div className="my-4">
          <GoogleRecapcha captchaRef={captchaRef} />
        </div>

        <CheckBox
          required
          label="By checking here and continuing, I agree to the Terms of Use."
        />
        {state.errorData && (
          <p className="my-2 text-xs text-red-500">{state.errorData}</p>
        )}
        <div className=" flex-row-center my-4">
          <Button label="Register as new gamer" />
        </div>
      </form>
      <p className="text-purple-500">or</p>
      <SocialLoginButton isdisabled={state.submitting} />
      <p className="mt-4 text-gray-600">
        Already have account?
        <span
          onClick={handleLoginClick}
          className="mx-1 cursor-pointer text-pink-600"
        >
          Sign in
        </span>
      </p>
    </div>
  );
};
export default FormRegister;
