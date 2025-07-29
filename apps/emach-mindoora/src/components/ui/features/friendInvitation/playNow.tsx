import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";

const PlayNow = ({
  inviteCode,
  roomId,
}: {
  inviteCode: string;
  roomId: string;
}) => {
  const router = useRouter();
  const session = useSession();
  const [, setModalState] = useRecoilState(modalRecoilState);

  const handleClick = async (e: any) => {
    e.preventDefault();
    setModalState({
      open: false,
      modalComponent: <></>,
    });
    const api = await apiSetup();

    try {
      await api.put(endPoints.gamePlayerProtected.confirmall, { roomId });
    } catch (error: any) {
      console.log(error);
    }
    router.push(`/game/${inviteCode}/${session.data?.user?.name}`);
  };

  return (
    <div>
      <GenericButton
        backgroundcolor="#FF6F40"
        textcolor="#fff"
        variant="shadow"
        activebgcolor="#FF6F50"
        isdisabled={false}
        shape="50px"
        shadowcolor="#888"
        size="large"
        onClick={(e: any) => handleClick(e)}
      >
        Play now
      </GenericButton>
    </div>
  );
};

export default PlayNow;
