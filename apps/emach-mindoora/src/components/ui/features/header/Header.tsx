import dynamic from "next/dynamic";
import { Styled } from "./Header.styled";
import { memo } from "react";
import Navbar from "./navbar/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Sidebar } from "../sidebar/Menu/Sidebar";
import HomeIcon from "./HomeIcon/HomeIcon";

const Logo = dynamic(import("./logo/Logo"));
const MemoLogo = memo(Logo);

export const Header = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const currentRouter = router.pathname === "/";

  return (
    <Styled.Header>
      {session?.user && !currentRouter ? <Sidebar /> : null}
      <HomeIcon />
      <MemoLogo />
      <Navbar />
    </Styled.Header>
  );
};
