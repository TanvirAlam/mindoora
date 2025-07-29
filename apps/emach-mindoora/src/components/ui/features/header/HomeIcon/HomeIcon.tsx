import { Styled } from "./HomeIcon.styled";
import { useSession } from "next-auth/react";
import { IoMdHome } from "react-icons/io";
import { useRouter } from "next/router";

const HomeIcon = () => {
    const { data: session } = useSession();
    const router = useRouter();

  return (
  <div>
      {session?.user && router.pathname === "/" && (
        <Styled.HomeButton onClick={() => router.push("/home")}>
          <IoMdHome />
        </Styled.HomeButton>
      )}
  </div>
  );
};

export default HomeIcon;
