import { Grid } from "@mui/material";
import SendingEmail from "./sendingEmail";
import QuickLink from "./QuickLink";
import Chat from "./mindooraSocialLinks";
import FooterEnd from "./FooterEnd";
import FooterImage from "./FooterImage";
import General from "./General";
import CookieConsent, { Cookies } from "react-cookie-consent";
import { useEffect, useState } from "react";

export const Footer = () => {
  const [cookieConsent, setCookieConsent] = useState(false);

  const handleCookieConsent = () => {
    localStorage.setItem("cookieConsent", "true");
  };

  useEffect(() => {
    if (localStorage.getItem("cookieConsent") === "true") {
      setCookieConsent(true);
    }
  }, []);


  return (
    <div className="w-[100%]">
      <div className="bg-[#4d297b] pl-2 pt-8 md:px-20 md:pt-10 pb-3">
        <Grid container>
          <Grid item xs={12} md={4}>
            <SendingEmail />
          </Grid>
          <Grid item xs={6} md={2}>
            <QuickLink />
          </Grid>
          <Grid item xs={6} md={2}>
            <General />
          </Grid>
          <Grid item xs={12} md={4}>
            <Chat />
          </Grid>
        </Grid>
      </div>
      <FooterImage />
      <FooterEnd />
      { !cookieConsent &&
        <CookieConsent
        location="bottom"
        buttonText="Sure man!!"
        cookieName="mindoora-user-cookie"
        buttonStyle={{
          color: "#4e503b",
          fontSize: "13px",
        }}
        onAccept={() => handleCookieConsent(true)}
        expires={10}
        enableDeclineButton
        onDecline={() => {
          alert("nay!");
        }}
        debug={true}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <img src="/assets/mindoora-svg-white.svg" width="40%" />
            <p>Mindoora uses cookies to enhance the user experience.</p>
          </div>
          <img src="/assets/footer/footer3.png" width="60%" />
        </div>
      </CookieConsent>
      }
    </div>
  );
};

export default Footer;
