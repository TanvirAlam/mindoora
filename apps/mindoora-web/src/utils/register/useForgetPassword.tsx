import { useForm } from "react-hook-form";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { postMethod } from "../api/postMethod";
import { endPoints } from "../api/route";
import { useRouter } from "next/router";
import Login from "~/components/ui/features/auth/login/Login";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "../../../../../packages/ui/components/utils/atoms/ModalState";
import ResetPassword from "~/components/ui/features/auth/reset-password/ResetPassword";

export const useForgetPassword = () => {
  const [state, setState] = useState({
    submitting: false,
    sendOTPData: "",
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ email: string }>();
  const { data: session } = useSession();
  const [, setModalState] = useRecoilState(modalRecoilState);
  const router = useRouter();
  console.log(session);

  const getValues = {
    email: watch("email"),
  };

  const handleLoginClick = (e: any) => {
    e.preventDefault();
    setModalState({
      open: true,
      modalComponent: <Login />,
    });
  };

  const onSubmit = async (data: { email: string }) => {
    setState((prev) => {
      return { ...prev, submitting: true };
    });
    localStorage.setItem("email", data.email);
    try {
      await postMethod(endPoints.auth.sendEmail, {
        email: data.email,
        emailType: "otpEmail",
      })
        .then((res) => {
          if (res.status === 200) {
            setModalState({
              open: true,
              modalComponent: <ResetPassword />,
            });
          }
          console.log(res);
        })
        .catch((error) => console.error(error));
      setState((prev) => {
        return { ...prev, submitting: false };
      });
    } catch (error) {
      console.error("Send OTP failed:", error);
      setState((prev) => {
        return { ...prev, submitting: false };
      });
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    getValues,
    handleLoginClick,
    state,
    onSubmit,
  };
};
