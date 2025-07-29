"use client";

import { useState, useEffect } from "react";
import type { GetServerSideProps } from "next";
import { Grid } from "@mui/material";
import { FloatingChat } from "~/components/ui/features/PBChat/FloatingChat";
import { QuestionsDisplay } from "~/components/ui/features/playground/questionDisplay";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import {
  gamePlayersRecoilState,
  gameResultRecoilState,
  gameRoomQuestionsRecoilState,
  gameRoomStatusRecoilState,
} from "~/utils/atom/gameRoom.atom";
import { endPoints } from "~/utils/api/route";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { apiSetup } from "~/utils/api/api";
import { gamePlayRecoilState } from "~/utils/atom/gamePlay.atom";
import { CustomLoader } from "~/ui/components/elements/GenericSpinner";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { QuestionProgressBar } from "~/components/ui/features/playground/questionDisplay/QuestionProgressBar";
import { useSession } from "next-auth/react";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import Image from "next/image";
import Players from "~/components/ui/features/friendInvitation/codeInvitation/players";
import { gamePlayDefaultValue } from "~/utils/atom/gamePlay.atom";
import myToast from "~/utils/toast";
import { GameRoomLayout } from "~/components/Layouts/GameRoomLayout";

const Playground = () => {
  const router = useRouter();
  const session = useSession();
  const { id } = router.query as { id: string };
  const { name } = router.query as { name: string };
  const [, setIsLoading] = useRecoilState(loadingRecoilState);

  const [, setModal] = useRecoilState(modalRecoilState);
  const [gamePlay, setGamePlay] = useRecoilState(gamePlayRecoilState);
  const [roomStatus] = useRecoilState(gameRoomStatusRecoilState);
  const [players, setPlayers] = useRecoilState(gamePlayersRecoilState);
  const [, setResult] = useRecoilState(gameResultRecoilState);
  const [questions, setQuestions] = useRecoilState(
    gameRoomQuestionsRecoilState
  );
  const qNumber = gamePlay.qNumber;
  const nQuestions = questions?.length;
  const playerId = gamePlay.playerId;
  const roomId = gamePlay.roomId;
  const thisRoomStatus = roomStatus.filter((r) => r.id === roomId);
  const thisPlayerData = players.find((p) => p.id === playerId);
  const [loading, setLoading] = useState(true);
  const progress = nQuestions
    ? Math.floor(((qNumber + 1) / nQuestions) * 100)
    : 0;
  const amIAdmin = players.filter(
    (p) => p.role === "admin" && p.name === session?.data?.user?.name
  )[0];

  const setQNumber = (number: number) => {
    setGamePlay((prev) => ({
      ...prev,
      qNumber: number,
    }));
  };
  const namePlayers = players.map((player) => player.name);

  useEffect(() => {
    setIsLoading(false);

    const fetchData = async () => {
      const api = await apiSetup();

      try {
        await api.put(endPoints.gameRoom.update, {
          id: roomId,
          status: "live",
        });
      } catch (error) {
        console.error("Error updating game room:", error);
      }
    };

    setQuestions([]);
    setPlayers([]);
    setResult([]);
    setQNumber(0);

    session && fetchData();

    return () => {
      setGamePlay(gamePlayDefaultValue);
      setQuestions([]);
      setPlayers([]);
      setResult([]);
      setQNumber(0);
    };
  }, []);

  useEffect(() => {
    const FetchRoomData = async () => {
      try {
        const api = await apiSetup();
        const response = await api.post(`${endPoints.gamePlayerOpen.create}`, {
          inviteCode: id,
          name,
        });

        if (response.status === 201) {
          const playerData = response.data.player;
          setGamePlay({
            ...gamePlay,
            gameId: response.data.gameId,
            name: name,
            playerId: playerData.id,
            roomId: playerData.roomId,
          });
          setPlayers(response.data.allPlayer);
          setModal({
            open: false,
            modalComponent: <></>,
          });
          setLoading(false);
        }
      } catch (err: any) {
        console.log(err);
      }
    };

    if (id && name && name.length <= 3) {
      toast.error("too short name");
      return;
    }

    id && name && FetchRoomData();
  }, [id, name]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = await apiSetup();
        const response = await api.get(
          `${endPoints.questionSolved.allrawv2}?playerId=${playerId}`
        );
        if (response.status === 201) {
          setQuestions(response.data.result.allQuestions);
        }
      } catch (err: any) {
        console.log(err);
        setQuestions([]);
      }
    };

    if (gamePlay.playerId !== "" && thisRoomStatus[0]?.status !== "finished") {
      fetchData();
    }

    if (gamePlay.playerId !== "" && thisRoomStatus[0]?.status === "finished") {
      setGamePlay((prevGamePlay) => {
        return {
          ...prevGamePlay,
          showResult: true,
        };
      });
    }
    if (
      gamePlay.playerId !== "" &&
      thisRoomStatus[0]?.status === "closed" &&
      !amIAdmin
    ) {
      router.push("/game");
      setModal({
        open: false,
        modalComponent: <></>,
      });
    }
  }, [thisRoomStatus[0]?.status, gamePlay.playerId]);

  if (loading) {
    return <CustomLoader isLoading={true} />;
  }

  return (
    !loading && (
      <GameRoomLayout
        child={
          <div className="relative mt-[6rem]">
            <Grid item xs={12} md={12}>
              <Grid container>
                <QuestionProgressBar progress={progress} />
                <Grid item xs={12} lg={12}>
                  {questions[qNumber] ? (
                    <QuestionsDisplay
                      qNumber={qNumber}
                      setQNumber={setQNumber}
                      questions={questions}
                      setQuestions={setQuestions}
                      setModal={setModal}
                      players={players}
                      gamePlay={gamePlay}
                      setGamePlay={setGamePlay}
                      nQuestions={nQuestions}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Image
                        src="/assets/mindoora.png"
                        width="500"
                        height="500"
                        alt="mindoora-logo"
                        className="z-50"
                      />
                      <Image
                        src="/assets/waiting.webp"
                        width="500"
                        height="500"
                        alt="waiting"
                      />
                      <Image
                        src="/assets/invitePeople.png"
                        alt="invite-people"
                        fill
                        className="blur-sm"
                      />
                      <Players players={namePlayers} />
                    </div>
                  )}
                </Grid>
              </Grid>
            </Grid>
            {thisPlayerData?.isApproved && <FloatingChat />}
            {myToast()}
          </div>
        }
      />
    )
  );
};

export default Playground;

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  };
};
