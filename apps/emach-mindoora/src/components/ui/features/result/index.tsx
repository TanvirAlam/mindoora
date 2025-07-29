import Trophy from "./trophy";
import Table from "./table";
import toast from "react-hot-toast";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { ModalWrapper } from "~/styles/mixins.styled";
import { Players, GameResult } from "~/types/type";
import { useRouter } from "next/router";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import Image from "next/image";
import {
  TwitterShareButton,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import { useEffect } from "react";

const Result = ({
  result,
  amIAdmin,
  handleEnd,
  isAdminPlaying
}: {
  result: GameResult[];
  amIAdmin: Players | undefined;
  handleEnd: () => void;
  isAdminPlaying: boolean
}) => {

  const filtered_result = result.filter((item) => item.points > 0);
    
  useEffect(() => {
    return () => {
      process.env.NODE_ENV === "production" && handleEnd();
    };
  }, []);

  return (
    <ModalWrapper>
      <div className="flex-col-center h-full w-full gap-4 rounded-xl bg-[url('/assets/abstract-bg.png')] bg-cover bg-center bg-no-repeat text-white">
        <Image
          src="/assets/mindoora.png"
          alt="mindoora-logo"
          width="300"
          height="300"
        />
        <h6 className="text-2xl font-bold">Final result</h6>
        <Trophy result={filtered_result} />
        <div className="flex gap-2">
          <TwitterShareButton
            url={"https://www.example.com"}
            quote={"Dummy text!"}
            hashtag="#muo"
          >
            <TwitterIcon size={20} round />
          </TwitterShareButton>
          <LinkedinShareButton
            url={"https://www.example.com"}
            quote={"Dummy text!"}
            hashtag="#muo"
          >
            <LinkedinIcon size={20} round />
          </LinkedinShareButton>
          <WhatsappShareButton
            url={"https://www.example.com"}
            quote={"Dummy text!"}
            hashtag="#muo"
          >
            <WhatsappIcon size={20} round />
          </WhatsappShareButton>
        </div>
        <Table result={filtered_result} />
        <div className="flex-row-center mb-8 gap-4">
          {amIAdmin && (
            <>
              <GenericButton
                backgroundcolor="#FF5254"
                textcolor="#fff"
                variant="shadow"
                activebgcolor="#00B1FF"
                isdisabled={false}
                shape="10px"
                shadowcolor="#888"
                size="large"
                onClick={handleEnd}
              >
                End game
              </GenericButton>
            </>
          )}
          <GenericButton
            backgroundcolor="#33D13F"
            textcolor="#fff"
            variant="shadow"
            activebgcolor="#00B1FF"
            isdisabled={false}
            shape="10px"
            shadowcolor="#888"
            size="large"
            onClick={handleEnd}
          >
            Share
          </GenericButton>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default Result;
