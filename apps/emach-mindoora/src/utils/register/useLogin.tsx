import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { captchaValidation } from "../api/reusableApi/captcha";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { loginModalState } from "~/ui/components/utils/atoms/loginModalState";
import Register from "~/components/ui/features/auth/registration/Register";
import ForgetPassword from "~/components/ui/features/auth/forgot-password/ForgetPassword";

export const useLogin = () => {
  const [state, setState] = useState({
    submitting: false,
    sendEmailData: "",
    errorData: "",
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();
  const captchaRef = useRef();
  const [, setModalState] = useRecoilState(modalRecoilState);
  const [, setLoginModal] = useRecoilState(loginModalState);
  const router = useRouter();
  const { data: session, status } = useSession();

  const getValues = {
    email: watch("email"),
    password: watch("password"),
  };

  const handleRegisterClick = (e: any) => {
    e.preventDefault();
    setLoginModal(false);
    setModalState({
      open: true,
      modalComponent: <Register/>,
    });
  };

  const handleForgetPasswordClick = (e: any) => {
    e.preventDefault();
    setModalState({
      open: true,
      modalComponent: <ForgetPassword />,
    });
  };

  const onSubmit = async (data: { email: string; password: string }) => {
    const token = captchaRef.current?.getValue();
    if (!token) {
      setState((prev) => {
        return { ...prev, errorData: "please validate the captcha" };
      });
      return;
    }else{
      setState((prev) => {
        return { ...prev, errorData: "" };
      });
    }
    const captchaStatus = await captchaValidation(token);
    if (captchaStatus !== 200){
      setState((prev) => {
        return { ...prev, errorData: "Captcha failed" };
      });
      return;
    }
    setState((prev) => {
      return { ...prev, submitting: true };
    });
    try {
      const result = await signIn("credentials", {
        ...data,
        redirect: false,
      });
      if (!session?.user.error) {
        setLoginModal(false);
        router.replace("/home");
      } else {
        setState((prev) => {
          return { ...prev, errorData: "Login Failed Due to Invalid Credentials" };
        });
      }
    } catch (error) {
      console.error("Login failed:", error);
      setState((prev) => {
        return { ...prev, errorData: "Login Failed Due to Invalid Credentials" };
      });
    }
    setState((prev) => {
      return { ...prev, submitting: true };
    });
  };

  return {
    register,
    handleSubmit,
    errors,
    state,
    captchaRef,
    onSubmit,
    handleRegisterClick,
    handleForgetPasswordClick,
    getValues,
  };
};
