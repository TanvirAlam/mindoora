import { Layout } from "~/components/Layouts";
import { getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps } from "next";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { PricingFeatures } from "~/components/ui/features/pricing";

const Pricing = () => {
  const router = useRouter();
  const [, setIsLoading] = useRecoilState(loadingRecoilState);

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
  }, []);

  return (
    <Layout
      child={
        <div className="p-[1rem] pt-[8rem]">
          <PricingFeatures />
        </div>
      }
    />
  );
};

export default Pricing;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
