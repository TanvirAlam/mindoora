import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { postMethod } from "../api/postMethod";
import { endPoints } from "../api/route";
import { useRouter } from "next/router";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "../../../../../packages/ui/components/utils/atoms/ModalState";
import Login from "~/components/ui/features/auth/login/Login";

export const useResetPassword = () => {
  const [state, setState] = useState({
    submitting: false,
    sendOTPData: "",
  });
  const [email, setEmail] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ otp: string; password: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [, setModalState] = useRecoilState(modalRecoilState);

  console.log(session);

  const getValues = {
    otp: watch("otp"),
    password: watch("password"),
  };

  const handleLoginClick = () => {
    setModalState({
      open: true,
      modalComponent: <Login />,
    });
  };
  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      // Access the localStorage value by key
      const storedEmail = localStorage.getItem("email");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  const onSubmit = async (data: { otp: string; password: string }) => {
    setState((prev) => {
      return { ...prev, submitting: true };
    });
    try {
      console.log(email, data.otp, data.password);
      await postMethod(endPoints.auth.resetPassword, {
        email,
        otp: parseInt(data.otp),
        password: data.password,
      })
        .then((res) => {
          if (res.status === 200) {
            handleLoginClick();
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
    email,
    handleLoginClick,
    state,
    onSubmit,
  };
};
