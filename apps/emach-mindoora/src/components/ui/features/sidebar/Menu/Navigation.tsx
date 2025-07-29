import Link from "next/link";
import { MenuItem } from "./MenuItem";
import { Styled } from "./Sidebar.styled";
import { SidebarMenuOptions } from "./menu.data";
import { VscFeedback } from "react-icons/vsc";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import Feedback from "../../feedback/Feedback";
import { LogoutButton } from "~/ui/components/elements/LogoutButton/LogoutButton";
import { variants as menuVariants } from "./MenuItem";
import { signOut } from "next-auth/react";
import { SearchBox } from "~/components/ui/elements/searchBox";
import Image from "next/image";
import { AboutUsModal } from "../../aboutus";

const variants = {
  open: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
    backgroundColor: "#4d297b",
    backdropFilter: `blur(0.475rem)`,
    boxShadow: "5px 5px 0 rgba(0, 0, 0, 0.2)",
    height: "100vh",
  },
  closed: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
    display: "none",
  },
};

export const Navigation = ({ toggle }) => {
  const [, setModalState] = useRecoilState(modalRecoilState);

  const handleModalFeedBack = () => {
    setModalState({
      open: true,
      modalComponent: <Feedback />,
    });
  };

  const handleModalAboutUs = () => {
    setModalState({
      open: true,
      modalComponent: <AboutUsModal />,
    });
  };

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await signOut({
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <Styled.sidebarUL variants={variants}>
      <div className="flex h-full flex-col justify-between">
        <div>
          <Styled.sidebarLI variants={menuVariants}>
            <SearchBox />
          </Styled.sidebarLI>
          {SidebarMenuOptions.map((value, i) => {
            return (
              <div key={i} onClick={toggle}>
                <MenuItem menuValue={value} i={i} />
              </div>
            );
          })}
        </div>
        <div className="pb-14">
          <Styled.sidebarLI
            variants={menuVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              onClick={handleModalFeedBack}
              className=" w-full border-t-2 border-slate-500 pt-2"
              href={""}
            >
              <div className="flex flex-row">
                <VscFeedback size={40} />
                <span className="ps-3 pt-1 text-lg font-semibold text-white">
                  Feedback
                </span>
              </div>
            </Link>
          </Styled.sidebarLI>
          <Styled.sidebarLI
            variants={menuVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-row" onClick={handleModalAboutUs}>
              <Image
                src={"/assets/mindoora-sidebar.svg"}
                alt=""
                width={35}
                height={30}
              />
              <span className="ps-4 pt-1 text-lg font-semibold text-white">
                About us
              </span>
            </div>
          </Styled.sidebarLI>
          <Styled.sidebarLI
            variants={menuVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-row ps-1">
              <LogoutButton handleLogout={handleLogout} />
              <span className="ps-4 pt-1 text-lg font-semibold text-white">
                Logout
              </span>
            </div>
          </Styled.sidebarLI>
        </div>
      </div>
    </Styled.sidebarUL>
  );
};
