import { useState, useEffect } from "react";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import styled from "styled-components";

const FollowButton = ({ followingId, isFollowing, fallBackFunction }: any) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleFollowButtonClick = async (followingId: string) => {
      setIsLoading(true);
      const api = await apiSetup();
      try {
        const response = await api.post(endPoints.follow.create, {
          followingId,
        });
        if (response.status === 201) {
          fallBackFunction();
        }
      } catch (error: any) {
        console.log(error);
      }
      setTimeout(async () => {
        setIsLoading(false);
      }, 1000);
    };

    const handleUnfollowButtonClick = async (followingId: string) => {
      setIsLoading(true);
      const api = await apiSetup();
      try {
        const response = await api.delete(endPoints.follow.delete, {
          params: {
            followingId,
          },
        });
        if (response.status === 204) {
          fallBackFunction();
        }
      } catch (error: any) {
        console.log(error);
      }
      setTimeout(async () => {
        setIsLoading(false);
      }, 1000);
    };

    const FollowingButton = styled.button`
    transition: width 600ms ease-in-out, left 600ms ease-in-out;
    width: auto;
    left: auto;
    color: ${props => props.isFollowing ? '#3399FF' : '#1a3726'};
    background-color: ${props => props.isFollowing ? '#FF69B4' : '#FFC0CB'};
    border: 2px solid ${props => props.isFollowing ? '#3399FF' : '#FF69B4'};
    border-radius: 25px;
    padding: 10px 20px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    outline: none;

    &:hover {
        background-color: ${props => props.isFollowing ? '#FFC0CB' : '#FF69B4'};
        border-color: ${props => props.isFollowing ? '#FF69B4' : '#FFC0CB'};
    }
`;

    return (
      <FollowingButton offsetWidth={50} isFollowing={isFollowing} onClick={isFollowing ? () => handleUnfollowButtonClick(followingId) : () => handleFollowButtonClick(followingId)} >
      {isLoading ? "Loading..." : isFollowing ? "Following" : "Follow"}
    </FollowingButton>
    );
  }

export default FollowButton;
