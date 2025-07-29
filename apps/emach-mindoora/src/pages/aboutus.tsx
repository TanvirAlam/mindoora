import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Layout } from "../components/Layouts";
import { fetchCarousel } from "~/utils/cms/carousel/fetchCarousel";
import type { GetServerSideProps } from "next";
import { AboutUsPage } from "~/components/ui/features/aboutus";

const Aboutus = () => {
  return (
    <Layout
      child={
        <>
          <AboutUsPage />
        </>
      }
    />
  );
};

export default Aboutus;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  const carouselList = await fetchCarousel();

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
      carouselList,
    },
  };
};
