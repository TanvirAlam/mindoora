import { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import { Hero } from "./userHero";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import FindFriendsToPlay from "./userFindFriendsToPlay/FindFriendsToPlay";
import TrendingCategories from "./userTrendingCategories/TrendingCategories";
import TopAuthur from "./userTopAuthur/TopAuthur";
import TopQuiz from "./userTopQuiz/TopQuiz";
import { DiscoverQuiz } from "./userGameList";
import { MobileHero } from "./userHero/MobileHero";
import type { Game } from "~/types/type";

const UserHome = ({
  games,
  fetch,
  targetRef,
}: {
  games: Game[];
  fetch: () => void;
  targetRef: any;
}) => {
  const [isLoading, setIsLoading] = useRecoilState(loadingRecoilState);

  const loadThePage = async () => {
    setTimeout(async () => {
      setIsLoading(false);
    }, 1000);
    return isLoading;
  };

  useEffect(() => {
    setIsLoading(true);
    loadThePage();
    fetch();
  }, []);

  return (
    !isLoading && (
      <Grid container spacing={2}>
        <div className="hidden w-full items-center justify-between lg:flex lg:items-center lg:gap-5 lg:pl-5">
          <Grid item xs={12} xl={6}>
            <Hero />
          </Grid>
          <Grid item xs={12} xl={6}>
            <FindFriendsToPlay />
          </Grid>
        </div>
        <div className="md:flex lg:hidden">
          <MobileHero />
        </div>
        <Grid container marginLeft={2}>
          <Grid item xs={12} xl={12}>
            <DiscoverQuiz
              games={games}
              fetch={function (): void {
                throw new Error("Function not implemented.");
              }}
              targetRef={undefined}
            />
          </Grid>
          <Grid item xs={12} xl={12}>
            <TrendingCategories />
          </Grid>
          <Grid item xs={12} xl={12}>
            <TopAuthur />
          </Grid>
          <Grid item xs={12} xl={12}>
            <DiscoverQuiz
              games={games}
              fetch={function (): void {
                throw new Error("Function not implemented.");
              }}
              targetRef={undefined}
            />
          </Grid>
        </Grid>
      </Grid>
    )
  );
};

export default UserHome;
