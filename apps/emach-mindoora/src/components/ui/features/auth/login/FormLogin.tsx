import { useLogin } from "~/utils/register/useLogin";
import Image from "next/image";
import SocialLoginButton from "../socialLogin/SocialLoginButton";
import Link from "next/link";
import { signIn } from "next-auth/react";

const FormLogin = () => {
  const { state } = useLogin();

  const handleSignIn = (e: any, provider: string) => {
    e.preventDefault();
    signIn(provider);
  };

  return (
    <>
      <div className="z-50 flex flex-col items-center justify-center">
        <Image
          className="absolute blur-sm"
          src="/assets/game-play.png"
          alt="play"
          fill
        />
        <Image
          src="/assets/mindoora.png"
          alt="mindoora-logo"
          className="backdrop-blur"
          width={250}
          height={20}
        />
        <div className="z-50 rounded-md bg-[#7D59A8] p-2 font-bold text-[#fff]">
          Log in using the following social media
        </div>
      </div>
      {/* <UserTypeSelection /> */}
      <SocialLoginButton
        isdisabled={state.submitting}
        handleSignIn={handleSignIn}
      />
      <div className="absolute bottom-1 z-50 flex w-full items-center justify-center text-xs text-white">
        <p>
          {" "}
          © {new Date().getFullYear()}{" "}
          <Link href={"www.emach-group.com"}>eMACH-Group.com</Link>
        </p>
      </div>
    </>
  );
};

export default FormLogin;
