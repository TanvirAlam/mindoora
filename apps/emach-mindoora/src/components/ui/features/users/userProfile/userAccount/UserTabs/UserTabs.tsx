import Image from "next/image";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import Profile from "./Profile";
import Account from "./Account";
import Social from "./Social";
import { UserTrophy } from "./userTrophy";
import { Styled } from "./UserTabs.styled";
import { useSession } from "next-auth/react";
import { useRef } from "react";

export const UserTabs = () => {
  const { data: session } = useSession();
  const ref = useRef(null);

  const getAvater = () => {
    const Avater = session?.user?.image;
    return Avater === "MindooraAvater"
      ? `/assets/${session?.user?.image}.png`
      : session?.user?.image;
  };
  return (
    <Tabs>
      <TabList>
        <Tab>
          <div className="flex items-center justify-center gap-2">
            <Styled.Avatar
              avatar={getAvater}
              ref={ref}
              className="img-rotate-button"
            >
              <div className="img outer ring" />
              <div className="img center ring" />
              <div className="img inner ring" />
            </Styled.Avatar>
            <span>Profile</span>
          </div>
        </Tab>
        <Tab>
          <div className="flex items-center justify-center gap-2">
            <Image src="/assets/user-acc.webp" alt="" width="25" height="20" />
            <span>Account</span>
          </div>
        </Tab>
        <Tab>
          <div className="flex items-center justify-center gap-2">
            <Image src="/assets/social.png" alt="" width="25" height="20" />
            <span>Social</span>
          </div>
        </Tab>
        <Tab>
          <div className="flex items-center justify-center gap-2">
            <Image src="/assets/trophy.png" alt="" width="25" height="20" />
            <span>Trophy</span>
          </div>
        </Tab>
      </TabList>

      <TabPanel>
        <Profile />
      </TabPanel>
      <TabPanel>
        <Account />
      </TabPanel>
      <TabPanel>
        <Social />
      </TabPanel>
      <TabPanel>
        <UserTrophy />
      </TabPanel>
    </Tabs>
  );
};
