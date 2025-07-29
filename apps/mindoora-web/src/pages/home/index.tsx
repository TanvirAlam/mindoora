import { Layout } from "~/components/Layouts";
import UserHome from "~/components/ui/features/users/UserHome";
import { getSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps } from "next";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { userGameRecoilState } from "~/utils/atom/userGame.atom";
import type { Game } from "~/types/type";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import myToast from "~/utils/toast";
import { TCAcceptHandler } from "~/components/ui/features/TermsAndConditions";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";

const Home = () => {
  const router = useRouter();
  const [, setIsLoading] = useRecoilState(loadingRecoilState);
  const [games, setGames] = useRecoilState<Game[]>(userGameRecoilState);
  const { tcAccepted, checkTCAccepted, recheck }: any = TCAcceptHandler();
  const [modalState,] = useRecoilState(modalRecoilState);

  const fetch = async () => {
    games.length === 0 &&
      setTimeout(async () => {
        try {
          const api = await apiSetup();
          const response = await api.get(`${endPoints.userGame.all}`);
          if (response.status === 200) {
            setGames(response.data.result.games);
          }
        } catch (error: any) {
          setGames([]);
        }
        setIsLoading(false);
      }, 0);
    games.length !== 0 && setIsLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      if (!session?.user) {
        await router.push("/");
      } else {
        checkTCAccepted();
        setIsLoading(false);
      }
    };

    recheck && fetchData();

  }, [modalState]);

  return (
    <Layout
      child={
        <div className="p-[1rem] pt-[8rem]">
          {tcAccepted && (
            <UserHome games={games} fetch={fetch} targetRef={undefined} />
          )}
          {/* Notification is for the next version */}
          {/* <NotificationChat /> */}
          {myToast()}
        </div>
      }
    />
  );
};

export default Home;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
