import { ChangeEvent, useState } from "react";
import { AddCoverPic } from "../AddCoverPic";
import { Styled } from "./CreateQuestions.styled";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import { questionRecoilState } from "~/utils/atom/gameQuestion.atom";
import { gameTypeRecoilState } from "~/utils/atom/questionTypes.atom";
import {
  initialFieldsRecoilState,
  initialFieldsRecoilStateTF,
  initialFieldsRecoilStateNoAns,
  intialState,
} from "~/utils/atom/initialFields.atom";
import { showCreateBtnState } from "~/utils/atom/showCreateBtn.atom";
import { useRecoilState } from "recoil";
import { QuestionTypes } from "./QuestionTypes";
import { QuestionInputs } from "./QuestionInputs";
import toast from "react-hot-toast";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import {
  CustomModalWrapper,
  CustomQuestionTabTitle,
} from "~/styles/mixins.styled";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export const CreateQuestions = () => {
  const [questionState, setQuestionState] = useRecoilState(questionRecoilState);
  const [questionType] = useRecoilState(gameTypeRecoilState);
  const [showCreateBtn] = useRecoilState(showCreateBtnState);
  const [, setModalState] = useRecoilState(modalRecoilState);
  const [inputQuestion, setInputQuestion] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const { t } = useTranslation();

  const initialStates = {
    mul: initialFieldsRecoilState,
    tf: initialFieldsRecoilStateTF,
    no: initialFieldsRecoilStateNoAns,
  };
  const [inputFields, setInputFields] = useRecoilState(
    initialStates[questionType]
  );

  const trueAnsValues = inputFields.reduce((acc, obj) => {
    if (obj.ans === true) {
      acc.push(obj.value);
    }
    return acc;
  }, []);

  const handleQuestionInput = (event: ChangeEvent<HTMLInputElement>) => {
    setInputQuestion(event.target.value);
  };

  const convertArrayToObject = (arr: (string | undefined)[]) => {
    const data: { [key: string]: string } = {};

    for (let index = 0; index < arr.length; index++) {
      const value = arr[index] as string;
      if (value !== undefined) {
        data[`option${index + 1}`] = value;
      }
    }
    return data;
  };

  const handleSubmit = async (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    addTheQuestion();
  };

  const addTheQuestion = (imageUrl?: string) => {
    const noAnswer =
      inputFields.filter((item) => item.ans === true).length === 0;
    if (noAnswer) {
      toast.error(t("Please select an answer"));
      return;
    }
    const Options = inputFields.map((item) => item.value);
    const lastId =
      questionState.length > 0
        ? Math.max(...questionState.map((question) => question.questionId))
        : 0;

    const newQuestion = {
      answer: Options.indexOf(trueAnsValues.toString()).toString(),
      options: convertArrayToObject(
        Object.values(inputFields.filter((item) => item.value !== "")).map(
          (item) => item.value
        )
      ),
      question: inputQuestion,
      questionId: lastId + 1,
      qSource: "qCustom",
      qImage: image,
      qPoints: 1,
      qTrophy: "noimage",
    };
    setQuestionState((prevState) => [...prevState, newQuestion]);
    setInputQuestion("");
    setInputFields(intialState);
    setModalState({
      open: false,
      modalComponent: <></>,
    });
  };

  return (
    <CustomModalWrapper>
      <Styled.CreateQuestion>
        <form className="form">
          <CustomQuestionTabTitle>
            <Image
              src="/assets/ai/custom.png"
              alt="ai-gen"
              width="100"
              height="100"
              className="relative overflow-hidden rounded-2xl"
            />
            <span>{t("Create your own questions!")}</span>
          </CustomQuestionTabTitle>
          <div className="relative flex-row items-center justify-center">
            <AddCoverPic setImage={setImage} imageName="questionImage" />
            <div className="flex items-center justify-center">
              <QuestionTypes />
            </div>
          </div>
          <label>
            <input
              required
              placeholder=""
              type="text"
              className="input"
              value={inputQuestion}
              onChange={handleQuestionInput}
            />
            <span>{t("Your Question?")}</span>
          </label>
          <div className="flex flex-col justify-start lg:flex-row">
            <QuestionInputs questionType={questionType} isEdit={false} />
          </div>
          {inputQuestion !== "" && showCreateBtn && (
            <GenericButton
              backgroundcolor="#FF4F40"
              textcolor="#fff"
              variant="shadow"
              activebgcolor="#FF6F50"
              isdisabled={false}
              shape="10px"
              shadowcolor="#888"
              size="medium"
              onClick={(e) => handleSubmit(e)}
            >
              {t("Create Question")}
            </GenericButton>
          )}
        </form>
      </Styled.CreateQuestion>
    </CustomModalWrapper>
  );
};
