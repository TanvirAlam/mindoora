import { useState } from "react";
import Image from "next/image";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
  FaDiscord,
} from "react-icons/fa";
import { Styled } from "./QuickLink.styled";

const Chat = () => {
  const [socialMedia] = useState([
    {
      name: "facebook",
      icon: FaFacebookF,
      link: "https://www.facebook.com/emachgroup",
    },
    {
      name: "instagram",
      icon: FaInstagram,
      link: "https://www.mindoora.com",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      link: "https://twitter.com/EmachGroup",
    },
    {
      name: "Linkedin",
      icon: FaLinkedinIn,
      link: "https://www.linkedin.com/company/98113208/admin/feed/posts/",
    },
    {
      name: "Discord",
      icon: FaDiscord,
      link: "https://discord.com/channels/@me",
    },
  ]);
  return (
    <div className="relative h-full flex-col text-white md:m-3 md:ml-16">
      <div className="flex flex-col items-center justify-center">
        <Styled.SocialIconsContainer>
          {socialMedia.map((item, index) => (
            <li key={index}>
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <i>
                  <item.icon />
                </i>
              </a>
            </li>
          ))}
        </Styled.SocialIconsContainer>
        <div className="bottom-0 right-0 flex flex-col items-center justify-center pb-6 pr-2 md:py-0">
          <Image
            src="/assets/footer-image.png"
            alt="mindoora-logo"
            width="200"
            height="150"
          />
          <Image
            src="/assets/mindoora-svg-white.svg"
            alt="mindoora-logo"
            width="150"
            height="200"
          />
        </div>
      </div>
    </div>
  );
};

export default Chat;
