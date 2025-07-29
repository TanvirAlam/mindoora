import React, { useEffect, useRef, useState } from "react";
import { UserGameModalWrapper } from "~/styles/mixins.styled";
import { fredoka } from "~/components/ui/elements/fonts/mindooraFonts";
import { Avatar } from "~/styles/mixins.styled";
import { Styled } from "./GameUserDetails.styled";
import { useSession } from "next-auth/react";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import FollowButton from "~/components/ui/elements/FollowButton/Follow";

export const GameUserDetails = ({ gameUserId }) => {
  const ref = useRef(null);
  const { data: session } = useSession();
  const [gameCreator, setGameCreator] = useState();
  const [isFollowing, setIsFollowing] = useState(false);
  const userId = session?.user?.id;

  const getAvater = () => {
    const Avater = session?.user?.image;
    return Avater === `/assets/${session?.user?.image}.png`;
  };

  const fetchGameUser = async () => {
    try {
      const api = await apiSetup();
      const response = await api.get(
        `${endPoints.user.getOne}?userId=${gameUserId}`
      );
      if (response.status === 201) {
        setGameCreator(response.data.result);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const fetchIsFollowing = async () => {
    try {
      const api = await apiSetup();
      const response = await api.get(
        `${endPoints.follow.isFollowing}?followingId=${gameUserId}`
      );
      if (response.status === 201) {
        setIsFollowing(response.data.result.isFollowing);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchGameUser();
    fetchIsFollowing();
  }, []);

  return (
    <UserGameModalWrapper className={fredoka.className}>
      <Styled.UserProfile>
        <div className="img-avatar">
          <Avatar
            avatar={gameCreator?.image}
            ref={ref}
            className="img-rotate-button"
          >
            <div className="img outer ring" />
            <div className="img center ring" />
            <div className="img inner ring" />
          </Avatar>
        </div>
        <div className="card-text">
          <div className="portada"></div>
          <div className="title-total">
            <div className="title text-xl font-bold">{gameCreator?.name}</div>

            <div className="desc">
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Laboriosam temporibus dignissimos repellat, laborum alias a
              dolorem sint exercitationem ea assumenda, porro tempore
              repellendus accusamus non itaque voluptates, doloribus ab facere.
            </div>
            <div className="actions">
              <button>
                <i className="far fa-heart"></i>
              </button>
              <button>
                <i className="far fa-envelope"></i>
              </button>
              <button>
                <i className="fas fa-user-friends"></i>
              </button>
              { gameCreator && userId !== gameCreator?.id &&
              <FollowButton isFollowing={isFollowing} followingId={gameUserId} fallBackFunction={fetchIsFollowing} />}
            </div>
          </div>
        </div>
      </Styled.UserProfile>
    </UserGameModalWrapper>
  );
};
