import { Styled } from "./Invite.styled";
import { QRCode } from "react-qrcode-logo";
import {
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import Players from "../friendInvitation/codeInvitation/players";
import { GamePlay, Players as pType } from "~/types/type";
import PlayNow from "../friendInvitation/playNow";
import { useRecoilState } from "recoil";
import { gamePlayersRecoilState } from "~/utils/atom/gameRoom.atom";
import { gamePlayRecoilState } from "~/utils/atom/gamePlay.atom";
import { ShareButton } from "../ShareBtn";
import { HostPlayOption } from "../../elements/HostPlayOption";
import Image from "next/image";
import {
  AiModalWrapper,
  CustomModalWrapper,
  ModalWrapper,
} from "~/styles/mixins.styled";

type InviteProps = {
  inviteCode: string;
};

export const Invite = ({ inviteCode }: InviteProps) => {
  const currentURL = window.location.origin;
  const inviteURL = currentURL + "/game/" + inviteCode;
  const [players] = useRecoilState<pType[]>(gamePlayersRecoilState);
  const [gamePlay, setGamePlay] = useRecoilState<GamePlay>(gamePlayRecoilState);
  const roomId = gamePlay?.roomId;
  const namePlayers = players.map((player) => player.name);
  const isAdminPlaying = gamePlay?.isAdminPlaying;

  const handleToggle = (e: any) => {
    setGamePlay((prev) => ({ ...prev, isAdminPlaying: e.target.checked }));
  };

  {
    /* Keep this we might needed
    <QRCode logoImage="/assets/qr-code/qr-code.png" value={inviteURL} /> */
  }
  return (
    <Styled.InviteWrapper>
      <div className="row">
        <div className="column">
          {inviteCode !== "Creating Code.." && (
            <Image
              src="/assets/qr-code/qr-code.png"
              width={200}
              height={100}
              alt="qr-code"
              className="border-2 border-solid border-[#683B98]"
            />
          )}
        </div>
        <div className="column">
          {inviteCode !== "Creating Code.." ? (
            <ShareButton inviteUrl={inviteURL} />
          ) : (
            inviteCode
          )}
        </div>
        <div className="column z-50">
          <Styled.InviteCode>{inviteCode}</Styled.InviteCode>
        </div>
        <div className="column z-50">
          <div className="flex flex-col items-center justify-center">
            {inviteCode !== "Creating Code.." && (
              <div className="flex flex-col items-center justify-center gap-4">
                <HostPlayOption
                  isChecked={isAdminPlaying}
                  onChangeHandler={handleToggle}
                />
                <PlayNow inviteCode={inviteCode} roomId={roomId} />
                <Players players={namePlayers} />
              </div>
            )}
          </div>
        </div>
        <div className="column z-50">
          <TwitterShareButton
            url={"https://www.example.com"}
            quote={"Dummy text!"}
            hashtag="#muo"
          >
            <TwitterIcon size={32} round />
          </TwitterShareButton>
          <LinkedinShareButton
            url={"https://www.example.com"}
            quote={"Dummy text!"}
            hashtag="#muo"
          >
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
          <WhatsappShareButton
            url={"https://www.example.com"}
            quote={"Dummy text!"}
            hashtag="#muo"
          >
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </div>
        <Image
          src="/assets/invite.png"
          width="800"
          height="100"
          alt="bgImage"
          className="absolute bottom-0 blur-sm"
        />
      </div>
    </Styled.InviteWrapper>
  );
};
