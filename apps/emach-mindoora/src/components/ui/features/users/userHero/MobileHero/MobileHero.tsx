import React, { useRef } from "react";
import { Avatar } from "~/styles/mixins.styled";
import { useSession, signOut } from "next-auth/react";
import FindFriendsToPlay from "../../userFindFriendsToPlay/FindFriendsToPlay";
import { IoIosNotifications } from "react-icons/io";
import { Styled } from "../../userFindFriendsToPlay/FindFriendsToPlay.styled";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { useRecoilState } from "recoil";
import InviteFriends from "../../userFindFriendsToPlay/InviteFriends";
import { FaQuestionCircle } from "react-icons/fa";
import { GiTabletopPlayers } from "react-icons/gi";
import { FaGamepad } from "react-icons/fa";
import Image from "next/image";

export const MobileHero = () => {
  const [, setModalState] = useRecoilState(modalRecoilState);
  const { data: session } = useSession();
  const ref = useRef(null);

  const getAvater = () => {
    const Avater = session?.user?.image;
    return Avater === "MindooraAvater"
      ? `/assets/${session?.user?.image}.png`
      : session?.user?.image;
  };

  const handleModalLoad = (e: any, MC: any) => {
    e.preventDefault();
    setModalState({
      open: true,
      modalComponent: MC,
    });
  };

  const inviteFriends = (e) => {
    handleModalLoad(e, <InviteFriends />);
  };
  return (
    <div className="relative top-[-20px] mb-16 flex h-[250px] w-[100vw] justify-center bg-[#7C5AA5]">
      <div className="relative mt-8 flex w-full items-start justify-between p-4 text-white">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/assets/my-mindoora.png"
            alt=""
            width={250}
            height={200}
            className="left absolute right-4 opacity-5 backdrop-blur"
          />
          <Avatar avatar={getAvater} ref={ref} className="img-rotate-button">
            <div className="img outer ring" />
            <div className="img center ring" />
            <div className="img inner ring" />
          </Avatar>
          <div className="flex flex-col gap-2">
            <span className=" text-lg font-bold">
              Hi! {session?.user?.name}
            </span>
            <span className="text-sm text-gray-300">
              @{session?.user?.email}
            </span>
          </div>
        </div>
        <div>
          <IoIosNotifications size={50} />
        </div>
      </div>
      <div className="absolute top-[50%] m-4 h-[200px] w-[90%] rounded-lg bg-[#DCDAE4] shadow-lg">
        <div className="flex items-center justify-around p-4 text-black">
          <div className="flex flex-col">
            <span className="font-bold">My Quiz</span>
            <div className="flex items-center justify-center gap-2">
              <div>
                {" "}
                <FaQuestionCircle size={25} color="#6756E8" />
              </div>
              <div className="font-mono text-lg font-bold">24</div>
            </div>
          </div>
          <div>
            <span className="font-bold">Played</span>
            <div className="flex items-center justify-center gap-2">
              <div>
                {" "}
                <IoIosNotifications size={30} color="#6756E8" />
              </div>
              <div className="font-mono text-lg font-bold">24</div>
            </div>
          </div>
          <div>
            <span className="font-bold">Players</span>
            <div className="flex items-center justify-center gap-2">
              <div>
                {" "}
                <FaGamepad size={30} color="#6756E8" />
              </div>
              <div className="font-mono text-lg font-bold">24</div>
            </div>
          </div>
        </div>
        <div>
          <div className="it relative m-2 flex h-[100px] flex-row items-center justify-between gap-2 rounded-xl bg-[#130F53] p-4">
            <div className="flex flex-col gap-2">
              <span className="text-lg font-bold text-white">
                Play with other friends
              </span>
              <Styled.FindFriends onClick={inviteFriends}>
                Find Friends
              </Styled.FindFriends>
            </div>
            <div>
              <Image
                src="/assets/invite-friends.png"
                alt=""
                width={100}
                height={100}
                className="absolute right-6 top-3"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
