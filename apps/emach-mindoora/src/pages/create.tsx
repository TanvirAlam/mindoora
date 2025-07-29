import { Layout } from "~/components/Layouts";
import { CreateAGame } from "~/components/ui/features/createGames/CreateAGame";
import { NotificationChat } from "~/components/ui/features/PBChat/Notifications";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps } from "next";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { questionRecoilState } from "~/utils/atom/gameQuestion.atom";
import myToast from "~/utils/toast";

const CreateGames = () => {
  const [, setIsLoading] = useRecoilState(loadingRecoilState);
  const [, setQuestion] = useRecoilState(questionRecoilState);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const session = await getSession();
      if (!session?.user) {
        await router.push("/");
      } else {
        setIsLoading(false);
      }
    };
    fetchData();
    setQuestion([]);
  }, []);

  return (
    <Layout
      child={
        <div className="pl-[1rem] pt-[8rem]">
          <CreateAGame />
          {/* Notification is for the next version */}
          {/* <NotificationChat /> */}
          {myToast()}
        </div>
      }
    />
  );
};

export default CreateGames;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
