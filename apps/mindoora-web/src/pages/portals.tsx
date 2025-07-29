"use client";

import { Layout } from "~/components/Layouts";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps } from "next";
import { useState, useEffect, useMemo, useRef } from "react";
import { endPoints } from "~/utils/api/route";
import { apiSetup } from "~/utils/api/api";
import type { Game } from "~/types/type";
import { MyGames } from "~/components/ui/features/MyGames";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { userGamePublicRecoilState } from "~/utils/atom/userGame.atom";
import myToast from "~/utils/toast";

const Portals = () => {
  const [games, setGames] = useRecoilState<Game[]>(userGamePublicRecoilState);
  const [isLoading, setIsLoading] = useRecoilState(loadingRecoilState);
  const router = useRouter();
  const category = useMemo(
    () => router.query.category,
    [router.query.category]
  );
  const catagorizedGames = games.filter((game) => game.category === category);
  const gameLength = category ? catagorizedGames.length : games.length;
  const targetRef = useRef(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const [isFetchFinished, setIsFetchFinished] = useState(false);
  const [zeroCount, setZeroCount] = useState(0);

  const fetch = async () => {
    let updatedLength = 0;

    !isFetchFinished &&
      setTimeout(async () => {
        try {
          const api = await apiSetup();
          const response = await api.get(
            `${endPoints.userGame.allpublicv2}?lastGame=${gameLength}${category ? `&category=${category}`: ""}`
          );
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
        } finally {
          setIsLoading(false);
        }
      }, 0);
    gameLength !== 0 && setIsLoading(false);
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
    if (!isLoading && gameLength > 0) {
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
        <div className="pl-[2rem] pt-[8rem]">
          <MyGames
            targetRef={targetRef}
            games={category ? catagorizedGames : games}
            fetch={fetch}
          />
          {/* Notification is for the next version */}
          {/* <NotificationChat /> */}
          {myToast()}
        </div>
      }
    />
  );
};

export default Portals;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
