import { useState, useEffect } from "react";
import Link from "next/link";
import { Styled } from "./Logo.styled";
import Image from "next/image";
import { useSession } from "next-auth/react";

const Logo = () => {
  const { data: session } = useSession();
  const [linkMainPage, setLinkMainPage] = useState("/");
  const isUserLoggedIn = session?.user ? true : false;

  useEffect(() => {
    if (session?.user) {
      setLinkMainPage("/");
    }
  }, []);

  return (
    <Link href={linkMainPage}>
      <Styled.Logo isUserLoggedin={isUserLoggedIn}>
        <Image
          src="/assets/mindoora.png"
          alt="mindoora-logo"
          width="300"
          height="20"
        />
      </Styled.Logo>
      <Styled.LogoMobile isUserLoggedin={isUserLoggedIn}>
        <Image
          src="/assets/mindoora-short.png"
          alt="mindoora-logo-mobile"
          width="300"
          height="20"
        />
      </Styled.LogoMobile>
    </Link>
  );
};

export default Logo;
