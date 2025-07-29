import React, { useEffect, useState } from "react";
import { Styled } from "./QuestionOverviews.styled";
import { useRecoilState } from "recoil";
import { questionRecoilState } from "~/utils/atom/gameQuestion.atom";
import { gameTypeRecoilState } from "~/utils/atom/questionTypes.atom";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { QuestionListType } from "~/types/type";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaGrinStars } from "react-icons/fa";
import Image from "next/image";
import { EditQuestions } from "../../CreateQuestions";
import TrophiesDropdown from "~/components/ui/elements/TrophyDropdown/TrophyDropdown";
import { AddQuestionPic } from "../../AddCoverPic/AddQuestionPic";
import { CreateButtonStyled } from "~/ui/components/elements/CreateButton/CreateButtonStyled";
import NoQuestionsCreated from "./noQuestions";
import { useTranslation } from "react-i18next";

export const QuestionOverviews = ({ onTabChange }: { onTabChange: any }) => {
  const [questionState, setQuestionState] = useRecoilState(questionRecoilState);
  const [, setQuestionType] = useRecoilState(gameTypeRecoilState);
  const [, setModalState] = useRecoilState(modalRecoilState);

  const [activeIndices, setActiveIndices] = useState([]);
  const [qPoints, setQPoints] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    return () => {
      setQuestionState([]);
    };
  }, []);

  const getQuestionById = (questionId) => {
    return questionState.find((question) => question.questionId === questionId);
  };

  const toggleAccordion = (index) => {
    setActiveIndices((prevIndices) => {
      if (prevIndices.includes(index)) {
        return prevIndices.filter((i) => i !== index);
      } else {
        return [...prevIndices, index];
      }
    });
  };

  const handleClick = () => {
    setIsActive(!isActive);
  };

  const handleModalLoad = (e: any, MC: any) => {
    e.preventDefault();
    setModalState({
      open: true,
      modalComponent: MC,
    });
  };

  function convertQuestionToOptionsArray(question) {
    const optionsArray = Object.keys(question.options).map((key, index) => ({
      index,
      id: `Q${index + 1}`,
      value: question.options[key],
      ans: question.answer === `${index}`,
    }));

    return optionsArray;
  }

  const editQuestion = (e, qID) => {
    const question_1 = questionState.filter((q) => q.questionId === qID)[0];
    const question_2 = question_1 && convertQuestionToOptionsArray(question_1);
    const isBoolean =
      question_2 && question_2.length === 2 && question_2[0].value === "True";
    setQuestionType(isBoolean ? "tf" : "mul");
    handleModalLoad(
      e,
      <EditQuestions options={question_2} q={question_1?.question} qID={qID} />
    );
  };

  const deleteQuestion = (e: any, qID: number) => {
    const arrCopy = Array.from(questionState);
    const questionIdIndex = arrCopy.findIndex((obj) => obj.questionId === qID);
    arrCopy.splice(questionIdIndex, 1);
    setQuestionState(arrCopy);
  };

  const questionSources = [
    {
      aiGen: "/assets/ai/ai-gen-nobg.png",
      qBank: "/assets/ai/q-bank-v1.png",
      qCustom: "/assets/ai/custom-nobg.png",
    },
  ];

  const getQuestionSource = (qSource: string) => {
    return questionSources[0][qSource];
  };

  const handleQPointsChange = (e: any, index: number) => {
    const value =
      e.target.value.trim() === "" ? 0 : e.target.value.replace(/\D/g, 0);

    setQuestionState((prevState) => {
      const updatedQuestions = [...prevState];
      updatedQuestions[index] = { ...updatedQuestions[index], qPoints: +value };
      return updatedQuestions;
    });
  };

  const Questions = questionState.map(
    (QnA: QuestionListType, index: number) => {
      const isActive = activeIndices.includes(index);
      const maxHeight = isActive
        ? `${document.getElementById(`panel-${index}`).scrollHeight}px`
        : "0";

      return (
        <div key={index} className="flex flex-col">
          <button
            className={`accordion relative flex items-center justify-between ${
              isActive ? "active" : ""
            }`}
            onClick={() => toggleAccordion(index)}
          >
            <Styled.QuestionTypeImage>
              <Image
                src={getQuestionSource(QnA.qSource)} //this is the default else user uploaed image
                className="rounded-lg border"
                alt="Question Source"
                width={50}
                height={50}
              />
              <div
                dangerouslySetInnerHTML={{
                  __html: index + 1 + ". " + QnA.question,
                }}
              />
              <Image
                src={getQuestionSource(QnA.qSource)}
                alt="Question Source"
                width={30}
                height={30}
                className="question-side-image"
              />
            </Styled.QuestionTypeImage>
            <Styled.QuestionActions>
              <div
                className={`navigation ${isActive ? "active" : ""}`}
                onClick={handleClick}
              >
                <span onClick={(e) => editQuestion(e, QnA.questionId)}>
                  <FaEdit onClick={(e) => editQuestion(e, QnA.questionId)} />
                </span>
                <span>
                  <FaGrinStars />
                </span>
                <span onClick={(e) => deleteQuestion(e, QnA.questionId)}>
                  <MdDelete
                    onClick={(e) => deleteQuestion(e, QnA.questionId)}
                  />
                </span>
              </div>
            </Styled.QuestionActions>
          </button>

          <div className="panel" id={`panel-${index}`} style={{ maxHeight }}>
            {Object.keys(QnA.options).length === 0 ? (
              <NoQuestionsCreated />
            ) : (
              <>
                <Styled.QuestionAnswers>
                  <div className="sm:w-full">
                    {Object.values(QnA.options).map(
                      (value: string, index: number) => {
                        const isCorrectAnswer = QnA.answer === index.toString();

                        return (
                          <Styled.QuestionAnswersBox
                            key={`${index}`}
                            CorrectAns={isCorrectAnswer}
                          >
                            {(index + 10).toString(36).toUpperCase()}.{" "}
                            <div
                              dangerouslySetInnerHTML={{
                                __html: value,
                              }}
                            />
                            {isCorrectAnswer && <span>{t("Answer")}</span>}
                          </Styled.QuestionAnswersBox>
                        );
                      }
                    )}
                  </div>
                  <div className="w-full">
                    <div className="container">
                      <div className="layout">
                        <div className="col col-main">
                          <TrophiesDropdown index={index} />
                        </div>
                      </div>
                      <div className="layout">
                        <div className="col col-main">
                          <div className="input-container">
                            <input
                              placeholder={qPoints.toString()}
                              className="input-field"
                              type="text"
                              name="qPoints"
                              onChange={(e) => handleQPointsChange(e, index)}
                            />
                            <label
                              htmlFor="input-field"
                              className="input-label"
                            >
                              {t("Points? (Optional)")}
                            </label>
                            <span className="input-highlight"></span>
                          </div>
                        </div>
                        <div
                          className="col col-complementary"
                          role="complementary"
                        >
                          <div className="flex items-center justify-center">
                            <div className="w-[100px]">
                              <AddQuestionPic
                                qSource={QnA.qSource}
                                image={QnA.qImage}
                                index={index}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Styled.QuestionAnswers>
                <div className="flex cursor-pointer gap-6 pb-4 pt-4">
                  <FaEdit
                    onClick={(e) => editQuestion(e, QnA.questionId)}
                    size={30}
                  />
                  <FaGrinStars size={30} />
                  <MdDelete
                    onClick={(e) => deleteQuestion(e, QnA.questionId)}
                    size={30}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
  );

  return (
    <>
      <Styled.SubTitle>
        <p>Overview</p>
      </Styled.SubTitle>
      <Styled.QuestionCreatedWrapper>
        {questionState.length > 0 ? Questions : <NoQuestionsCreated />}
      </Styled.QuestionCreatedWrapper>
    </>
  );
};
