import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { GenericButton } from "../../../../../../../../../packages/ui/components/elements/Buttons/Button";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "../../../../../../../../../packages/ui/components/utils/atoms/ModalState";
import Login from "../../../auth/login/Login";

export default function LoginButton() {
  const { data: session } = useSession();
  const router = useRouter();
  const [, setModalState] = useRecoilState(modalRecoilState);

  const handleClick = async (e: any) => {
    e.preventDefault();
    await signOut({
      callbackUrl: "/",
    });
  };

  const handleModal = (e: any) => {
    e.preventDefault();
    setModalState({ open: true, modalComponent: <Login /> });
  };

  return (
    <div className="text-white">
      {session?.user.accessToken ? (
        <div>
          <GenericButton
            variant="shadow"
            backgroundcolor="DodgerBlue"
            shadowcolor="gray"
            activebgcolor="RoyalBlue"
            textcolor="white"
            width="auto"
            onClick={handleClick}
          >
            {" "}
            Sign out
          </GenericButton>
        </div>
      ) : (
        <div>
          <GenericButton
            variant="shadow"
            backgroundcolor="DodgerBlue"
            shadowcolor="gray"
            activebgcolor="RoyalBlue"
            textcolor="white"
            width="auto"
            onClick={handleModal}
          >
            Sign in
          </GenericButton>
        </div>
      )}
    </div>
  );
}
