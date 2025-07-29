import React, { useState } from "react";
import Image from "next/image";
import { QuestionListType } from "~/types/type";
import { Styled } from "../QuestionOverviews.styled";

export const QuestionViews = ({ questions }) => {
  const [activeIndices, setActiveIndices] = useState([]);

  const Questions = questions?.map((QnA: QuestionListType, index: number) => {
    const isActive = activeIndices.includes(index);
    const maxHeight = isActive
      ? `${document.getElementById(`panel-${index}`).scrollHeight}px`
      : "0";

    const NoQuestionsCreated = () => {
      return (
        <div className="no-games-created">
          <Image
            src={"/assets/no-games-created.png"}
            alt="no-games-created"
            width={50}
            height={100}
          />
        </div>
      );
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
        </button>

        <div className="panel" id={`panel-${index}`} style={{ maxHeight }}>
          {Object.keys(QnA.options).length === 0 ? (
            <NoQuestionsCreated />
          ) : (
            <>
              <Styled.QuestionAnswers>
                <div className="flex justify-between pl-2 pr-2 sm:w-full">
                  <div>
                    {Object.values(QnA.options).map(
                      (value: string, index: number) => {
                        const isCorrectAnswer =
                          QnA.answer === (index + 1).toString();
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
                            {isCorrectAnswer && <span>ANSWER</span>}
                          </Styled.QuestionAnswersBox>
                        );
                      }
                    )}
                  </div>
                  <div>
                    <Image
                      src={QnA?.qImage}
                      width="100"
                      height="100"
                      alt="q-image"
                      className="rounded-full"
                    />
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div>
                      <Image
                        src={`/assets/trophies/${QnA?.qTrophy}.png`}
                        width="40"
                        height="100"
                        alt="q-image"
                        className="rounded-full"
                      />
                    </div>
                    <div>{QnA?.qTrophy}</div>
                    <div>
                      <div className="flex w-full flex-col items-center justify-center">
                        <span className="w-full text-sm">Points:</span>
                        <span>{QnA?.qPoints}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Styled.QuestionAnswers>
            </>
          )}
        </div>
      </div>
    );
  });

  return (
    <Styled.QuestionCreatedWrapper>{Questions}</Styled.QuestionCreatedWrapper>
  );
};
