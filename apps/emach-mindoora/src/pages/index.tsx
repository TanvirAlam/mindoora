import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Layout } from "../components/Layouts";
import { fetchCarousel } from "~/utils/cms/carousel/fetchCarousel";
import type { CarouselPropsType } from "~/types/type";
import type { GetServerSideProps } from "next";
import { CardRevealAnimation } from "~/components/ui/features/heroCarousel/cardReveal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";

const Index = ({ carouselList }: CarouselPropsType) => {
  const session = useSession();
  const router = useRouter();
  const [, setIsLoading] = useRecoilState(loadingRecoilState);

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/home");
    }
    setIsLoading(false);
  }, [session.status, router]);

  return (
    session.status === "authenticated" ||
    (session.status === "unauthenticated" && (
      <Layout
        child={
          <>
            <CardRevealAnimation
              carouselList={carouselList}
              isTextColor={false}
            />
          </>
        }
      />
    ))
  );
};

export default Index;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const carouselList = await fetchCarousel();

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
      carouselList,
    },
  };
};
