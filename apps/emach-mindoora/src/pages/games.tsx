"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { Layout } from "~/components/Layouts";
import { MyGames } from "~/components/ui/features/MyGames";
import { NotificationChat } from "~/components/ui/features/PBChat/Notifications";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps } from "next";
import { endPoints } from "~/utils/api/route";
import { apiSetup } from "~/utils/api/api";
import type { Game } from "~/types/type";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { userGameRecoilState } from "~/utils/atom/userGame.atom";
import myToast from "~/utils/toast";
import { useRef, useState } from "react";

const Games = () => {
  const [games, setGames] = useRecoilState<Game[]>(userGameRecoilState);
  const [isLoading, setIsLoading] = useRecoilState(loadingRecoilState);
  const router = useRouter();
  const isScroll = router.query?.isScroll === "true";
  const gameLength = games.length;
  const targetRef = useRef(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isFetchFinished, setIsFetchFinished] = useState(false);
  const [zeroCount, setZeroCount] = useState(0);

  useEffect(() => {
    if (isScroll && gameLength !== 0) {
      const targetDiv = document.getElementById(`target_${gameLength}`);
      if (targetDiv) {
        targetDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isScroll, gameLength]);


  const fetch = async () => {
    let updatedLength = 0;
    !isFetchFinished &&
      setTimeout(async () => {
        try {
          const api = await apiSetup();
          const response = await api.get(`${endPoints.userGame.allv2}?lastGame=${gameLength}`);
          if (response.status === 200) {
            const newGames = response.data.result.games;
            setGames((prevGames) => {
              const uniqueNewGames = newGames.filter(
                (newGame: { id: string }) =>
                  !prevGames.some((game) => game.id === newGame.id)
              );
              updatedLength = uniqueNewGames.length;
              return [...prevGames, ...uniqueNewGames];
            });
          }
        } catch (error: any) {
          console.log(error);
        }
        setIsLoading(false);
      }, 0);
    games.length !== 0 && setIsLoading(false);
    if (updatedLength === 0) {
      setZeroCount(zeroCount + 1);
      zeroCount > Math.floor(gameLength / 5) * 2 + 6 &&
        setIsFetchFinished(true);
    }
  };

  const fetchDataIfSessionExists = async () => {
    const session = await getSession();
    if (!session?.user) {
      await router.push("/");
    } else {
      fetch();
    }
  };

  useEffect(() => {
    fetchDataIfSessionExists();
    return () => {
      setIsFetchFinished(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && games.length > 0) {
      observer.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (
              entry.isIntersecting &&
              entry.target.id === `target_${gameLength - 5}`
            ) {
              fetchDataIfSessionExists();
            }
          });
        },
        { threshold: 1 }
      );

      if (targetRef.current) {
        observer.current.observe(targetRef.current);
      }
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, games]);

  return (
    <Layout
      child={
        <div className="pl-[1rem] pt-[8rem]">
          <MyGames pathName="/games" games={games} fetch={fetch} targetRef={targetRef} />
          {/* Notification is for the next version */}
          {/* <NotificationChat /> */}
          {myToast()}
        </div>
      }
    />
  );
};

export default Games;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
