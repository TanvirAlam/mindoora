import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import { useSession } from "next-auth/react";
import type { GamePlay } from "~/types/type";
import { useRecoilState } from "recoil";
import type { GameRoomQuestions } from "~/types/type";
import { Styled } from "./QuestionsDisplay.styled";
import { QuestionTimer } from "./QuestionTimer";
import { gameIdRecoilState } from "~/utils/atom/gameId.atom";
import Result from "../../result";
import { Players } from "~/types/type";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { fredoka } from "~/components/ui/elements/fonts/mindooraFonts";
import { useSocket } from "~/utils/contexts/SocketContext";
import { ThankYou } from "../../thankYou";
import { gamePlayersRecoilState } from "~/utils/atom/gameRoom.atom";
import FriendList from "~/components/ui/elements/friendList/friendList";
import { Fireworks as FireWorksComponent } from "@fireworks-js/react";
import { useRouter } from "next/router";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { handleSaveGameExperience } from "./apiConnector/QDFetch";
import { messagesRecoilState } from "~/utils/atom/gameRoom.atom";
import { QuestionTrophy } from "./QuestionTrophy";

export const QuestionsDisplay = ({
  questions,
  setQuestions,
  qNumber,
  setQNumber,
  setModal,
  players,
  gamePlay,
  setGamePlay,
  nQuestions,
}: {
  questions: GameRoomQuestions[];
  setQuestions: React.Dispatch<React.SetStateAction<GameRoomQuestions[]>>;
  qNumber: number;
  setQNumber: (number: number) => void;
  setModal: any;
  players: Players[];
  gamePlay: GamePlay;
  setGamePlay: React.Dispatch<React.SetStateAction<GamePlay>>;
  nQuestions: number;
}) => {
  const session = useSession();
  const { socket } = useSocket();
  const [, setGameId] = useRecoilState(gameIdRecoilState);
  const [modal] = useRecoilState(modalRecoilState);
  const questionData = questions[qNumber];
  const playerId = gamePlay.playerId;
  const roomId = gamePlay.roomId;
  const keys = Object.keys(questionData.options as Record<string, string>);
  const amIAdmin = players.filter(
    (p) => p.role === "admin" && p.name === session.data?.user?.name
  )[0];

  const showResult = gamePlay.showResult;
  let result = [];

  const [selected, setSelected] = useState<number>();
  const [waitingTime, setWaitingTime] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const timeTaken = 60 - seconds;
  const [, setIsLoading] = useRecoilState(loadingRecoilState);
  const router = useRouter();

  const [gamePlayers] = useRecoilState(gamePlayersRecoilState);
  const namePlayersAnswered =
    questionData?.answeredBy?.map((p) => {
      const player = gamePlayers.find((q) => q.id === p);
      return player?.name;
    }) || [];

  const [pointUpdate, setPointUpdate] = useState(false);
  const isAdminPlaying = gamePlay.isAdminPlaying;
  const [messages] = useRecoilState(messagesRecoilState);
  const [funTime, setFunTime] = useState(0);

  const goToNextQuestion = (e?: any) => {
    e?.preventDefault();
    socket?.emit("next_question", {
      roomId: gamePlay.roomId,
      qNumber,
    });
    if (!waitingTime) {
      setSeconds(30);
      setPointUpdate(true);
      setWaitingTime(true);
    }
  };

  socket.on("next_question_response", (data: any) => {
    if (!waitingTime) {
      setSeconds(30);
      setWaitingTime(true);

      if (qNumber !== data.qNumber) {
        setQNumber(data.qNumber);
      }

      if (!pointUpdate) {
        setPointUpdate(true);
      }
    }
  });

  const skipToNextQuestion = (e?: any) => {
    e?.preventDefault();
    socket?.emit("skip_to_next_question", {
      roomId: gamePlay.roomId,
      qNumber,
    });
    if (waitingTime) {
      setFunTime((prev) => prev + (30 - seconds));
      setSeconds(60);
      setWaitingTime(false);
      setPointUpdate(false);
      setQNumber(qNumber + 1);
    }
  };

  socket.on("skip_to_next_question_response", (data: any) => {
    if (waitingTime) {
      setSeconds(60);
      setWaitingTime(false);
      setPointUpdate(false);
      if (qNumber === data.qNumber) {
        setQNumber(data.qNumber + 1);
      }
    }
  });

  useEffect(() => {
    setSelected(undefined);
  }, [qNumber]);

  const handleSubmitClick = async (indexValue: any) => {
    if (timeTaken === 0) {
      toast.error("Too Early Submission");
      setSelected(undefined);
      return;
    }
    if (timeTaken === 60) {
      toast.error("Time Exceeds");
      return;
    }
    try {
      const api = await apiSetup();
      const response = await api.post(endPoints.questionSolved.create, {
        playerId,
        questionId: questionData?.id,
        answer: indexValue.toString(),
        timeTaken,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleResultClick = async () => {
    gamePlay.gameId && setGameId(gamePlay.gameId);

    try {
      const api = await apiSetup();
      const response = await api.get(
        `${endPoints.gamePlayerOpen.result}?roomId=${roomId}&playerId=${playerId}`
      );
      if (response.status === 201) {
        result = response.data.result;
        setModal({
          open: true,
          modalComponent: (
            <Result
              result={result}
              amIAdmin={amIAdmin}
              handleEnd={handleEnd}
              isAdminPlaying={isAdminPlaying}
            />
          ),
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmitAnswer = async (indexValue: any) => {
    setSelected(indexValue);
    handleSubmitClick(indexValue);
  };

  useEffect(() => {
    const fetchDataAndReset = async () => {
      await handleResultClick();

      setGamePlay((prevGamePlay) => ({
        ...prevGamePlay,
        showResult: false,
      }));

      setQuestions([]);
    };

    if (showResult && modal.open === false) {
      fetchDataAndReset();
    }
  }, [showResult, modal.open]);

  const handleCloseClick = async (e: any) => {
    e.preventDefault();
    handleSaveGameExperience({
      roomId,
      totalQ: nQuestions,
      timeTaken: funTime + (30 - seconds),
      totalText: messages.length,
    });
    try {
      const api = await apiSetup();
      api.put(`${endPoints.gameRoom.update}`, {
        id: roomId,
        status: "finished",
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  const getQuestionImage = (
    waitingTime: boolean,
    selected: number | undefined,
    questionData: GameRoomQuestions | undefined
  ) => {
    if (questionData?.qImage) {
      return (
        <div className="relative flex h-auto max-w-lg items-center justify-center rounded-lg blur-sm transition-all duration-300 hover:blur-none">
          <Image
            src={questionData?.qImage}
            width={100}
            height={100}
            alt="q-img"
            className="h-56 w-56 rounded-full"
          />
        </div>
      );
    }
  };

  const getAnswerImage = (waitingTime, selected, index, questionData) => {
    if (waitingTime) {
      return questionData?.answer === selected ? (
        <>
          <Styled.AnswerImage
            src="/assets/check.gif"
            alt=""
            width={100}
            height={100}
          />
          <FireWorksComponent
            options={{
              rocketsPoint: {
                min: 0,
                max: 10,
              },
            }}
            style={{
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              position: "fixed",
            }}
          />
          <QuestionTrophy
            questionTrophy={questionData?.qTrophy}
            extraPoints={questionData?.qPoints}
          />
        </>
      ) : (
        <Styled.AnswerImage
          src="/assets/wrong.gif"
          alt="wrong-answer-image"
          width={100}
          height={100}
        />
      );
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (seconds > 0) {
        setSeconds((prevSeconds: number) => prevSeconds - 1);
        return;
      }
      if (seconds === 0 && nQuestions !== qNumber + 1) {
        if (!waitingTime) {
          amIAdmin && goToNextQuestion();
        } else {
          amIAdmin && skipToNextQuestion();
        }
        return;
      }
      if (seconds === 0 && nQuestions === qNumber + 1) {
        if (!waitingTime) {
          setWaitingTime(true);
          setSeconds(30);
        } else {
          setModal({
            open: true,
            modalComponent: <ThankYou />,
          });
          clearInterval(interval);
        }
        return;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const handleEnd = async (e?: any) => {
    e?.preventDefault();
    const api = await apiSetup();

    try {
      const response = await api.put(endPoints.gameRoom.update, {
        id: amIAdmin?.roomId,
        status: "closed",
      });
      if (response.status === 201) {
        toast.success(response.data.message);
        setModal({
          open: false,
          modalComponent: <></>,
        });
        router.push("/games");
        setIsLoading(true);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  return (
    players.length !== 0 && (
      <Styled.QuestionWrapper>
        <Styled.TimerSection seconds={seconds}>
          <QuestionTimer seconds={seconds} />
        </Styled.TimerSection>
        {amIAdmin && (
          <div className="z-30 flex w-full items-center justify-between">
            <Styled.QuestionsAnsCTANextLeft>
              {!waitingTime && (
                <Styled.ShowResult
                  onClick={(e: any) =>
                    !waitingTime && seconds != 0 && goToNextQuestion(e)
                  }
                >
                  <span>Show</span>
                  <Image
                    src="/assets/next.png"
                    alt="next-btn"
                    width="100"
                    height="100"
                  />
                </Styled.ShowResult>
              )}
              {waitingTime && questions.length > qNumber + 1 && (
                <Styled.ShowResult onClick={(e: any) => skipToNextQuestion(e)}>
                  <span>Skip</span>
                  <Image
                    src="/assets/skip.png"
                    alt="skip-btn"
                    width="100"
                    height="100"
                  />
                </Styled.ShowResult>
              )}
              {qNumber > nQuestions - 2 && waitingTime && (
                <Styled.ShowResult onClick={(e: any) => handleCloseClick(e)}>
                  <span>Result</span>
                  <Image
                    src="/assets/result.png"
                    alt=""
                    width="100"
                    height="100"
                  />
                </Styled.ShowResult>
              )}
            </Styled.QuestionsAnsCTANextLeft>
            <Styled.QuestionsAnsCTANextRight>
              <Styled.ShowResult onClick={(e: any) => handleEnd(e)}>
                <span>End</span>
                <Image src="/assets/exit.png" alt="" width="100" height="100" />
              </Styled.ShowResult>
            </Styled.QuestionsAnsCTANextRight>
          </div>
        )}
        <div className="flex flex-row">
        <FriendList
          players={namePlayersAnswered}
          roomStatusLive={true}
          pointUpdate={pointUpdate}
        />
          {getQuestionImage(waitingTime, selected, questionData)}
        </div>


        <Styled.Question>
          <span
            className={fredoka.className}
            dangerouslySetInnerHTML={{ __html: questionData?.question }}
          />
        </Styled.Question>

        <Styled.QuestionWrapperGrid>
          {keys.map((key, index) => (
            <>
              {getAnswerImage(waitingTime, selected, index, questionData)}
              <Styled.RadioBtn
                key={index}
                color={
                  waitingTime
                    ? selected === index
                      ? questionData?.answer === index
                        ? "#73da59"
                        : "#c74c27"
                      : questionData?.answer === index
                      ? "#73da59"
                      : "#fee8c3"
                    : selected === index
                    ? "#f0940b"
                    : "#fee8c3"
                }
              >
                <input
                  type="radio"
                  id={String(questionData?.options?.[key])}
                  name={questionData?.question}
                  value={index + 1}
                  checked={selected === index}
                  onClick={() => {
                    if ((amIAdmin && isAdminPlaying) || !amIAdmin) {
                      if (!waitingTime && selected === undefined) {
                        handleSubmitAnswer(index);
                      }
                    }
                  }}
                />
                <label htmlFor={String(questionData?.options?.[key]) ?? ""}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        questionData?.options && questionData?.options[key],
                    }}
                  />
                </label>
              </Styled.RadioBtn>
            </>
          ))}
        </Styled.QuestionWrapperGrid>
      </Styled.QuestionWrapper>
    )
  );
};
