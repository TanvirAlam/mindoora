import { useEffect, useRef, useState } from "react";
import { Styled } from "./Navbar.styled";
import { LogoutButton } from "~/ui/components/elements/LogoutButton/LogoutButton";
import Modal from "~/ui/components/elements/Modal/GenericModal";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Login from "../../auth/login/Login";
import { useRecoilState } from "recoil";
import { loginModalState } from "~/ui/components/utils/atoms/loginModalState";
import { useTranslation } from "react-i18next";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import Image from "next/image";
import Tooltip from "@mui/material/Tooltip";

const NewNav = () => {
  const { data: session } = useSession();
  const [isSideBar, setIsSideBar] = useState(false);
  const [loginModal, setLoginModal] = useRecoilState(loginModalState);
  const ref = useRef(null);
  const router = useRouter();
  const { t } = useTranslation();

  const closeModal = (): void => {
    setLoginModal(false);
  };

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await signOut({
      redirect: true,
      callbackUrl: "/",
    });
  };

  useEffect(() => {
    const checkInterval = setInterval(async () => {
      const sessionExpiration = session?.expires;
      if (sessionExpiration && new Date() > new Date(sessionExpiration)) {
        clearInterval(checkInterval);
        await signOut({
          redirect: true,
          callbackUrl: "/",
        });
      }
    }, 5000);
  }, [router, session]);

  const getAvater = () => {
    const Avater = session?.user?.image;
    return Avater === "MindooraAvater"
      ? `/assets/${session?.user?.image}.png`
      : session?.user?.image;
  };

  return (
    <Styled.Navbar>
      <div className="nav-end">
        <div className="right-container">
          {session?.user?.image ? (
            <Styled.DesktopWrapper>
              <GenericButton
                variant="shadow"
                shadowcolor="gray"
                onClick={() => {
                  router.push("/game");
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Image
                    src="/assets/join-game-mindoora.png"
                    alt="join-game-mindoora"
                    width={30}
                    height={30}
                  />
                  <span>{t("Join Game")}</span>
                </div>
              </GenericButton>

              <Styled.Avatar
                avatar={getAvater}
                ref={ref}
                className="img-rotate-button"
              >
                <div className="img outer ring" />
                <div className="img center ring" />
                <div className="img inner ring" />
              </Styled.Avatar>
              <LogoutButton handleLogout={handleLogout} />
            </Styled.DesktopWrapper>
          ) : session?.user?.name ? (
            <div className="flex items-center justify-center">
              <div
                ref={ref}
                className="w-full cursor-pointer rounded-full bg-orange-600"
              >
                <span className="flex items-center justify-center text-lg font-bold text-white">
                  {session?.user?.name.slice(0, 1)}
                </span>
              </div>
              <LogoutButton handleLogout={handleLogout} />
            </div>
          ) : (
            <>
              <Tooltip title={t("Click to join a game!")}>
                <GenericButton
                  variant="shadow"
                  backgroundcolor="#7D5AA6"
                  shadowcolor="gray"
                  onClick={() => {
                    router.push("/game");
                  }}
                >
                  <Image
                    src="/assets/join-game-mindoora.png"
                    alt="join-game-mindoora"
                    width={20}
                    height={10}
                  />
                  <span className="text-sm font-bold">{t("Join Game")}</span>
                </GenericButton>
              </Tooltip>
              {/* <LanguageSelections /> */}
              <Styled.Avatar
                avatar={"/assets/login3.png"}
                ref={ref}
                className="img-rotate-button"
                onClick={() => setLoginModal(true)}
              >
                <div className="img outer ring" />
                <div className="img center ring" />
                <div className="img inner ring" />
              </Styled.Avatar>
            </>
          )}
        </div>
        <Modal isOpen={loginModal} closeModal={closeModal}>
          <div className="overflow-hidden">
            <Login />
          </div>
        </Modal>
      </div>
    </Styled.Navbar>
  );
};

export default NewNav;
