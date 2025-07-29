import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import type { saveGameConfigureType } from "../../types/type";
import { endPoints } from "../api/route";
import { useRecoilState } from "recoil";
import { gameIdRecoilState } from "../atom/gameId.atom";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { apiSetup } from "../api/api";
import { questionRecoilState } from "../atom/gameQuestion.atom";
import { loadingRecoilState } from "../atom/loading.atom";
import { iUpload } from "../imageUpload";

export const useGameConfigure = () => {
  const [image, setImage] = useState<File | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<saveGameConfigureType>();
  const [questionState,] = useRecoilState(questionRecoilState);
  const [, setIsLoading] = useRecoilState(loadingRecoilState);
  const [, setGameId] = useRecoilState(gameIdRecoilState);
  const [totalTime, setTotalTime] = useState(0);
  let timeUpdate = true;

  const saveSteps = async (data: saveGameConfigureType, imgUrl?: string) => {
    if (questionState.length < 1) {
      toast.error("Question is absent");
      return;
    }

    const api = await apiSetup();
    api
      .post(endPoints.userGame.create, {
        title: data.title,
        language: "EN",
        nPlayer: "8",
      })
      .then( async (res) => {
        if (res.status === 201) {
          setGameId(res.data.gameId);

          api
            .post(endPoints.gameDetails.create, {
              gameId: res.data.gameId,
              imgUrl,
              description: data.description,
              isPublic: data.isPublic,
              category: data.category,
              keyWords: data.keyWords,
            })
            .catch((error: any) => {
              console.log(error);
            });

          const timeStart = new Date();
          for (let i = 0; i < questionState.length; i++) {
            const optionsObject = questionState[i]?.options;
            const response = questionState[i]?.qImage instanceof File && await iUpload(questionState[i]?.qImage);

            const imageUrl = response && response?.status === 201 ? response.data.imageUrl : "noimage";

            api
              .post(endPoints.question.create, {
                gameId: res.data.gameId,
                question: questionState[i]?.question,
                answer: questionState[i]?.answer || "0",
                options: optionsObject ?? [],
                qSource: questionState[i]?.qSource,
                qImage: imageUrl,
                qPoints: questionState[i]?.qPoints,
                qTrophy: questionState[i]?.qTrophy,
              })
              .catch((error) => {
                console.log(error);
              });
              const timeEnd = new Date();
              const timeDiff = timeEnd.getTime() - timeStart.getTime();
              timeUpdate && setTotalTime((timeDiff / 1000) * questionState.length);
              timeUpdate = false;
          }
          toast.success("Game Created");
          router.push("/games?isScroll=true");
          setIsLoading(true);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const onSubmit = async (data: saveGameConfigureType) => {
    if (!(image instanceof File)) {
      await saveSteps(data);
      return;
    } else {
      const response = await iUpload(image);
      if (response?.status === 201) {
        const imgUrl = response.data.imageUrl;
        await saveSteps(data, imgUrl);
      } else {
        console.log("Image upload failed");
      }
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    onSubmit,
    setImage,
    setValue,
    totalTime
  };
};
