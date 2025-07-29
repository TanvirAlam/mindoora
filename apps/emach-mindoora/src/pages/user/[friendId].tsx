"use client";

import { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import { Layout } from "~/components/Layouts";
import { useRecoilState } from "recoil";
import { endPoints } from "~/utils/api/route";
import { useRouter } from "next/router";
import { apiSetup } from "~/utils/api/api";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import myToast from "~/utils/toast";

const GameDetails = () => {
  const router = useRouter();
  const { friendId } = router.query as { friendId: string };
  const [, setIsLoading] = useRecoilState(loadingRecoilState);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [isApprover, setIsApprover] = useState(false);

  const fetch = async () => {
    setTimeout(async () => {
      try {
        const api = await apiSetup();
        const response = await api.get(
          `${endPoints.user.getOne}?userId=${friendId}`
        );
        if (response.status === 201) {
          setData(response.data.result);
        }
      } catch (error: any) {
        console.log(error)
      }
      setIsLoading(false);
    }, 0);
  };

  const fetchStatus = async () => {
    setTimeout(async () => {
      try {
        const api = await apiSetup();
        const response = await api.get(
          `${endPoints.friend.status}?friendId=${friendId}`
        );
        if (response.status === 201) {
          setStatus(response.data.result.status);
          setIsApprover(response.data.result.isApprover);
        }
      } catch (error: any) {
        setStatus("");
        console.log(error);
      }
    }, 0);
  };

  useEffect(() => {
    fetch();
    fetchStatus();
  }, []);

  const sendFriendRequests = async (e) => {
    e.preventDefault();
    try {
      const api = await apiSetup();
      const response = await api.post(endPoints.friend.send, { friendId });
      if (response.status === 201) {
        fetchStatus();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const acceptFriendRequests = async (e) => {
    e.preventDefault();
    try {
      const api = await apiSetup();
      const response = await api.put(endPoints.friend.accept, {
        userId: friendId,
      });
      if (response.status === 201) {
        fetchStatus();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const textInButton = () => {
    switch (status) {
      case "REQUESTED":
        return isApprover ? "Accept Request" : "Request Sent";
      case "ACCEPTED":
        return "Unfriend";
      default:
        return "Send Request";
    }
  };

  const deleteFriendRequests = async (e) => {
    e.preventDefault();
    try {
      const api = await apiSetup();
      const response = await api.delete(`${endPoints.friend.delete}?friendId=${friendId}`);
      if (response.status === 204) {
        fetchStatus();
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const handleButtonClick = (e) => {
    switch (status) {
      case "REQUESTED":
        return isApprover && acceptFriendRequests(e);
      case "ACCEPTED":
        return deleteFriendRequests(e);
      default:
        return sendFriendRequests(e);
    }
  };

  const handlRejectButton = async (e) => {
    e.preventDefault();
    deleteFriendRequests(e);
  };

  return (
    <Layout
      child={
        <div className="flex items-center justify-center">
          {data !== null && (
            <div>
              <h2>{data.name}</h2>
              <img
                className=" cursor-pointer"
                onClick={() => window.open(`/user/${data.user.id}`, "_blank")}
                src={data.image}
                alt="User Image"
              />
            </div>
          )}
          {status !== "ITSME" && (
            <GenericButton
              onClick={(e) => handleButtonClick(e) }
              variant="filled"
              backgroundcolor="DodgerBlue"
              shadowcolor="gray"
              activebgcolor="RoyalBlue"
              textcolor="white"
            >
              {textInButton()}
            </GenericButton>
          )}
          {
            status !== "ITSME" && status === "REQUESTED" &&  (
              <GenericButton
                onClick={(e) => handlRejectButton(e) }
                variant="filled"
                backgroundcolor="Red"
                shadowcolor="gray"
                activebgcolor="RoyalBlue"
                textcolor="white"
              >
                {isApprover ? "Reject" : "Cancel Request"}
              </GenericButton>
            )
          }
          {myToast()}
        </div>
      }
    />
  );
};

export default GameDetails;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
