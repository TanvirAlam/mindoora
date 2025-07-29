import { useRouter } from "next/router";
import Image from "next/image";
import Button from "~/ui/components/elements/AnimatedButton/button";
import ReactCodeInput from "react-verification-code-input";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { loginModalState } from "~/ui/components/utils/atoms/loginModalState";
import { emailState } from "~/ui/components/utils/atoms/emailState";
import { endPoints } from "~/utils/api/route";
import { apiSetup } from "~/utils/api/api";

const FormVerify = () => {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const [, setModalState] = useRecoilState(modalRecoilState);
  const [, setLoginModal] = useRecoilState(loginModalState);
  const [email] = useRecoilState(emailState);

  const verifyEmail = async (e: any) => {
    e?.preventDefault();
    const api = await apiSetup();
    api
      .post(`${endPoints.auth.verify}?email=${email}&passcode=${passcode}`)
      .then((response) => {
        if (response.status === 200) {
          setModalState({
            open: false,
            modalComponent: <></>,
          });
          setLoginModal(true);
        } else {
          console.log(`Verification failed with status ${response.status}`);
          setError("Captcha Mismatched. Please Retry.");
        }
      });
  };

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
      <span className="mt-12 pb-6 text-2xl font-medium xl:-mt-0">
        We need to verify your email
      </span>
      <p className=" w-72 text-center text-sm text-gray-500">
        You’re almost there! Please check your inbox for verification code sent
        to
        <span className="px-1 font-bold">{email ?? ""}</span>
      </p>
      <p className=" w-72 text-center text-sm text-gray-500">
        Enter your 6-digit verification code below
      </p>
      <form className="w-full max-w-sm lg:mt-10" onSubmit={verifyEmail}>
        <div className="flex flex-row justify-center">
          <ReactCodeInput fields={4} onChange={(val) => setPasscode(val)} />
        </div>
        {error && (
          <p className="flex-row-center my-2 text-xs text-red-500">{error}</p>
        )}
        <div className=" flex-row-center my-4">
          <Button label="Verify Email" />
        </div>
      </form>
      <p className="mt-4 underline" onClick={() => router.push("/login")}>
        Can’t find it? Please check your spam folder.
      </p>
    </div>
  );
};

export default FormVerify;
