import { Layout } from "~/components/Layouts";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps } from "next";
import GameInvite from "~/components/ui/features/Invite/gameInvite";
import Image from "next/image";

const InvitePlayers = () => {
  return (
    <Layout
      child={
        <div className="flex items-center justify-center pl-8">
          <GameInvite />
          <Image
            src="/assets/invitePeople.png"
            alt="invite-people"
            fill
            className="absolute"
          />
        </div>
      }
    />
  );
};

export default InvitePlayers;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
