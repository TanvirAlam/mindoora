"use client";

import { Layout } from "~/components/Layouts";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps } from "next";
import GameInvite from "~/components/ui/features/Invite/gameInvite";
import Image from "next/image";

const Game = () => {
  return (
    <Layout
      child={
        <div className="flex items-center justify-center">
          <Image
            src="/assets/invitePeople.png"
            alt="invite-people"
            fill
            className="absolute"
          />
          <GameInvite />
        </div>
      }
    />
  );
};

export default Game;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
