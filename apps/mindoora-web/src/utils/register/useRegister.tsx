import { useForm } from "react-hook-form";
import type { RegisterFormData } from "../../types/type";
import { useRef, useState } from "react";
import { endPoints } from "../api/route";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "../../../../../packages/ui/components/utils/atoms/ModalState";
import { emailState } from "../../../../../packages/ui/components/utils/atoms/emailState";
import ModalMessage from "~/components/ui/elements/message/modalMessage";
import { captchaValidation } from "../api/reusableApi/captcha";
import { apiSetup } from "../api/api";
import Verify from "~/components/ui/features/auth/verifyEmail/verify";
import { loginModalState } from "../../../../../packages/ui/components/utils/atoms/loginModalState";

export const useRegister = () => {
  const [state, setState] = useState({
    submitting: false,
    sendEmailData: "",
    errorData: "",
  });
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>();
  const captchaRef = useRef();
  const [, setModalState] = useRecoilState(modalRecoilState);
  const [, setLoginModal] = useRecoilState(loginModalState);
  const [, setEmailState] = useRecoilState(emailState);

  const getValues = {
    name: watch("name"),
    email: watch("email"),
    password: watch("password"),
    image: 'http://noimage.com',
    role: 'Gamer'
  };


  const handleLoginClick = (e: any) => {
    e.preventDefault();
    setLoginModal(true);
    setModalState({
      open: false,
      modalComponent: <></>,
    });
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = captchaRef?.current?.getValue();

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

    const api = await apiSetup();
    api.post(endPoints.auth.register, getValues)
    .then((response)=>{
      if (response.status === 201) {
        setEmailState(getValues.email);
        setModalState({
          open: true,
          modalComponent: <Verify />,
        });
      } else {
        console.log(response.data)
      }
    }).catch((error)=>{
      console.error("Registration failed:", error);
      setState((prev) => {
        return { ...prev, errorData: "Registration Failed Due to Invalid Credentials" };
      });
    });
    setState((prev) => {
      return { ...prev, submitting: false };
    });
  };

  return {
    register,
    errors,
    state,
    captchaRef,
    getValues,
    handleLoginClick,
    onSubmit,
  };
};
