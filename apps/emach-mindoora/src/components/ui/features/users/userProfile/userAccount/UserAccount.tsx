import { useSession, signOut } from "next-auth/react";
import { LogoutButton } from "~/ui/components/elements/LogoutButton/LogoutButton";
import { useRef } from "react";
import { UserTabs } from "./UserTabs";

import {
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import { Avatar } from "~/styles/mixins.styled";

const UserAccount = () => {
  const { data: session } = useSession();
  const ref = useRef(null);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await signOut({
      redirect: true,
      callbackUrl: "/",
    });
  };

  const getAvater = () => {
    const Avater = session?.user?.image;
    return Avater === "MindooraAvater"
      ? `/assets/${session?.user?.image}.png`
      : session?.user?.image;
  };

  return (
    <div className="h-full w-full">
      <div className="h-full w-full rounded-[2rem] bg-[#4d297b] text-white">
        {/* this can be a componeent */}
        <div className="flex w-full items-center justify-start gap-5 p-4">
          <Avatar avatar={getAvater} ref={ref} className="img-rotate-button">
            <div className="img outer ring" />
            <div className="img center ring" />
            <div className="img inner ring" />
          </Avatar>
          <div>
            <div className="text-bold flex flex-col font-mono text-xl font-bold">
              <span>{session?.user?.name}</span>
              <span className="text-xs">{session?.user?.email}</span>
            </div>
            <div className="flex gap-4 p-4">
              <>
                <div className="flex flex-col border-r-[0.05rem] border-gray-50 pr-4">
                  <span className="text-sm text-stone-400">Friends</span>
                  <span className="text-xl font-bold">120</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-stone-400">Played game</span>
                  <span className="text-xl font-bold">81</span>
                </div>
              </>
            </div>
            <div className="text-bold flex gap-2 font-mono text-sm font-bold">
              <LogoutButton handleLogout={handleLogout} />
              <div className="flex items-center justify-center gap-2">
                <TwitterShareButton
                  url={"https://www.example.com"}
                  quote={"Dummy text!"}
                  hashtag="#muo"
                >
                  <TwitterIcon size={32} round />
                </TwitterShareButton>
                <LinkedinShareButton
                  url={"https://www.example.com"}
                  quote={"Dummy text!"}
                  hashtag="#muo"
                >
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
                <WhatsappShareButton
                  url={"https://www.example.com"}
                  quote={"Dummy text!"}
                  hashtag="#muo"
                >
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
              </div>
            </div>
          </div>
        </div>
        <div className="p-5">
          <UserTabs />
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
