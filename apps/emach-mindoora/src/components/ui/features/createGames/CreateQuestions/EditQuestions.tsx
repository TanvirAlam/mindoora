import { ChangeEvent, useEffect, useState } from "react";
import { Styled } from "./CreateQuestions.styled";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import { questionRecoilState } from "~/utils/atom/gameQuestion.atom";
import { gameTypeRecoilState } from "~/utils/atom/questionTypes.atom";
import {
  initialFieldsRecoilState,
  initialFieldsRecoilStateTF,
  initialFieldsRecoilStateNoAns,
} from "~/utils/atom/initialFields.atom";
import { CustomModalWrapper } from "~/styles/mixins.styled";
import { useRecoilState } from "recoil";
import { QuestionTypes } from "./QuestionTypes";
import { QuestionInputs } from "./QuestionInputs";
import toast from "react-hot-toast";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { AddQuestionPic } from "../AddCoverPic/AddQuestionPic";
import { useTranslation } from "react-i18next";

export const EditQuestions = ({
  options,
  q,
  qID,
}: {
  options: any;
  q: string;
  qID: number;
}) => {
  const [questionState, setQuestionState] = useRecoilState(questionRecoilState);
  const [questionType, setQuestionType] = useRecoilState(gameTypeRecoilState);
  const [, setModalState] = useRecoilState(modalRecoilState);
  const [inputQuestion, setInputQuestion] = useState("");
  const { t } = useTranslation();

  const initialStates = {
    mul: initialFieldsRecoilState,
    tf: initialFieldsRecoilStateTF,
    no: initialFieldsRecoilStateNoAns,
  };
  const [inputFields, setInputFields] = useRecoilState(
    initialStates[questionType]
  );
  const questionImage = questionState.find(
    (question) => question.questionId === qID
  )?.qImage;

  const questionIndex = questionState.findIndex(
    (question) => question.questionId === qID
  );

  const trueAnsValues =
    Array.isArray(inputFields) &&
    inputFields.reduce((acc, obj) => {
      if (obj.ans === true) {
        acc.push(obj.value);
      }
      return acc;
    }, []);

  useEffect(() => {
    setInputFields(options);
    setInputQuestion(q);
    return () => {
      setInputFields([]);
    };
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

  const addTheQuestion = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const noAnswer =
      inputFields.filter((item) => item.ans === true).length === 0;
    if (noAnswer) {
      toast.error(t("Please select an answer"));
      return;
    }
    const Options = inputFields.map((item) => item.value);

    const newQuestion = {
      ...questionState[questionIndex],
      answer: Options.indexOf(trueAnsValues.toString()).toString(),
      options: convertArrayToObject(
        Object.values(inputFields.filter((item) => item.value !== "")).map(
          (item) => item.value
        )
      ),
      question: inputQuestion,
      questionId: qID,
    };
    const otherQuestions = questionState.filter((q) => q.questionId !== qID);
    setQuestionState(
      [...otherQuestions, newQuestion].sort(
        (a, b) => a.questionId - b.questionId
      )
    );
    setInputQuestion("");
    setInputFields(initialStates[questionType]);
    setModalState({
      open: false,
      modalComponent: <></>,
    });
  };

  return (
    <CustomModalWrapper>
      <Styled.CreateQuestion>
        <form className="form">
          <p className="title">{t("Edit the Question!")}</p>
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
          <div className="flex flex-col justify-center lg:flex-row">
            <div>
              <div className="flex items-center justify-center">
                <div className="w-[200px]">
                  <AddQuestionPic image={questionImage} index={questionIndex} />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <QuestionTypes />
              </div>
            </div>
            {inputFields.length >= 2 && (
              <QuestionInputs questionType={questionType} isEdit={true} />
            )}
          </div>
          {inputQuestion !== "" && (
            <GenericButton
              backgroundcolor="#FF4F40"
              textcolor="#fff"
              variant="shadow"
              activebgcolor="#FF6F50"
              isdisabled={false}
              shape="10px"
              shadowcolor="#888"
              size="medium"
              onClick={addTheQuestion}
            >
              {t("Edit")}
            </GenericButton>
          )}
        </form>
      </Styled.CreateQuestion>
    </CustomModalWrapper>
  );
};
