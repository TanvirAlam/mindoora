import { useState, useEffect } from "react";
import { TermsAndConditions } from "~/components/ui/features/TermsAndConditions";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { useRecoilState } from "recoil";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";

export const TCAcceptHandler = () => {
  const [tcAccepted, setTCAccepted] = useState<boolean | undefined>(false);
  const [, setModal] = useRecoilState(modalRecoilState);
  const [recheck, setRecheck] = useState<boolean>(true);

  const checkTCAccepted = async () => {
    if(!recheck){
      return
    }
    try {
      const api = await apiSetup();
      const response = await api.get(endPoints.acceptTC.get);

      if (response.status === 201) {
        setTCAccepted(true);
      }
    } catch (error) {
      setTCAccepted(false);
      recheck &&
      setModal({
        open: true,
        modalComponent: (
          <TermsAndConditions checkTCAccepted={checkTCAccepted} setRecheck={setRecheck} />
        ),
      });
    }
  };

  useEffect(() => {
    checkTCAccepted();
  }, []);

  return {
    recheck,
    tcAccepted,
    checkTCAccepted,
  };
};
