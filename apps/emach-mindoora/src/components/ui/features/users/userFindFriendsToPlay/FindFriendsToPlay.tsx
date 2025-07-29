import React from "react";
import { Styled } from "./FindFriendsToPlay.styled";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { useRecoilState } from "recoil";
import InviteFriends from "./InviteFriends";
import Image from "next/image";

const FindFriendsToPlay = () => {
  const [, setModalState] = useRecoilState(modalRecoilState);

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
    <div className="h-full w-full">
      <Styled.FindFriendsContentWrapper>
        <div className="flex w-full flex-col items-start justify-between gap-8 pl-8 pr-8">
          <div className="flex w-full items-center justify-between">
            <div>
              <Styled.Heading>
                Play Brain games togather with your friends now
              </Styled.Heading>
              <Styled.FindFriends onClick={inviteFriends}>
                Find Friends
              </Styled.FindFriends>
            </div>
            <div>
              <Image
                src="/assets/invite-friends.png"
                alt=""
                width={200}
                height={150}
                className="relative right-6"
              />
            </div>
          </div>
        </div>
      </Styled.FindFriendsContentWrapper>
    </div>
  );
};

export default FindFriendsToPlay;
