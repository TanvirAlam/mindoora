import { useState } from "react";
import { Styled } from "./ExistingQuestions.styled";
import {
  Categories,
  NumOptions,
  DificultyOptions,
  TypeOptions,
} from "../category.data";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import { ImCross } from "react-icons/im";
import { FaCheckCircle } from "react-icons/fa";
import { useRecoilState } from "recoil";
import { questionRecoilState } from "~/utils/atom/gameQuestion.atom";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { CustomLoader } from "~/ui/components/elements/GenericSpinner";
import axios from "axios";
import toast from "react-hot-toast";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import {
  CustomModalWrapper,
  CustomQuestionTabTitle,
} from "~/styles/mixins.styled";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export const ExistingQuestions = () => {
  const [numQuestions, setNumQuestion] = useState("5");
  const [Category, setCategory] = useState("Any");
  const [Difficulty, setDifficulty] = useState("Any");
  const [Type, setType] = useState("Any");
  const [questions, setQuestions] = useState([]);
  const [questionState, setQuestionState] = useRecoilState(questionRecoilState);
  const [checkedItems, setCheckedItems] = useState<{ [id: number]: boolean }>(
    {}
  );
  const [selectAllShow, setSelectAllShow] = useState(true);
  const [, setModalState] = useRecoilState(modalRecoilState);
  const [isLoading, setIsloading] = useState(false);
  const { t } = useTranslation();

  const onChangeNumQuestion = (event: { target: { value: any } }) => {
    setNumQuestion(event.target.value);
  };

  const onChangeCategory = (event: { target: { value: any } }) => {
    setCategory(event.target.value);
  };

  const onChangeDifficulty = (event: { target: { value: any } }) => {
    setDifficulty(event.target.value);
  };

  const onChangeType = (event: { target: { value: any } }) => {
    setType(event.target.value);
  };

  const generateQuestions = async () => {
    let baseURL = `https://opentdb.com/api.php?amount=${numQuestions}`;
    setIsloading(true);

    if (Category !== "Any") {
      baseURL += `&category=${Category}`;
    }
    if (Difficulty !== "Any") {
      baseURL += `&difficulty=${Difficulty}`;
    }
    if (Type !== "Any") {
      baseURL += `&type=${Type}`;
    }

    await new Promise(async (resolve) => {
      setQuestions([]);
      setSelectAllShow(true);
      const api = await apiSetup();
      try {
        const data = (await axios.get(baseURL)).data;
        if (data.response_code === 0) {
          addQuestionId(data.results);
          api.post(endPoints.qInDb.create, data.results).catch((err: any) => {
            console.log(err);
          });
        }
        if (data.response_code === 1) {
          toast.error("No Question Matches Current Call.");
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error. Try Another Match Now Or Later.");
      }
      setIsloading(false);
    });
  };

  const addQuestionId = (questions: any) => {
    const lastId =
      questionState.length > 0
        ? Math.max(...questionState.map((question) => question.questionId))
        : 0;
    const newQuestions = questions.map((question: any, index: number) => ({
      ...question,
      questionId: index + 1 + lastId,
      isChecked: false,
    }));
    setQuestions(newQuestions);
    setSelectAllShow(false);
  };

  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  const shuffle = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

  const addQuestion = async (e: any, _selectedQuestion: any) => {
    const selectedQuestion = JSON.parse(JSON.stringify(_selectedQuestion));
    selectedQuestion.incorrect_answers.push(_selectedQuestion.correct_answer);
    const allIncorrectOptions = shuffle(selectedQuestion.incorrect_answers);

    setCheckedItems({
      ...checkedItems,
      [selectedQuestion.questionId]: !checkedItems[selectedQuestion.questionId],
    });

    if (selectedQuestion) {
      const index = Object.values(
        convertArrayToObject(allIncorrectOptions)
      ).indexOf(selectedQuestion.correct_answer);
      setQuestionState([
        ...questionState,
        {
          answer: index.toString(),
          options: convertArrayToObject(allIncorrectOptions),
          question: selectedQuestion.question,
          questionId: selectedQuestion.questionId,
          qSource: "qBank",
          qPoints: 1,
          qTrophy: "noimage",
        },
      ]);

      await delay(500);
      const freshQuestions = questions.filter(
        (question) => question.questionId != e.target.value
      );
      setQuestions(freshQuestions);
    }
  };

  const addAllQuestions = async (e: any) => {
    e.preventDefault();
    const newQuestionState = [...questionState];

    questions.forEach((_selectedQuestion: any) => {
      const selectedQuestion = JSON.parse(JSON.stringify(_selectedQuestion));

      selectedQuestion.incorrect_answers.push(_selectedQuestion.correct_answer);
      const allIncorrectOptions = shuffle(selectedQuestion.incorrect_answers);

      setCheckedItems({
        ...checkedItems,
        [selectedQuestion.questionId]:
          !checkedItems[selectedQuestion.questionId],
      });

      if (selectedQuestion) {
        const index = Object.values(
          convertArrayToObject(allIncorrectOptions)
        ).indexOf(selectedQuestion.correct_answer);
        newQuestionState.push({
          answer: index.toString(),
          options: convertArrayToObject(allIncorrectOptions),
          question: selectedQuestion.question,
          questionId: selectedQuestion.questionId,
          qSource: "qBank",
          qPoints: 1,
          qTrophy: "noimage",
        });
      }
    });

    setQuestionState(newQuestionState);
    setSelectAllShow(true);
    setQuestions([]);
  };

  return (
    <CustomModalWrapper>
      <Styled.QuestionsGenerator>
        <CustomQuestionTabTitle>
          <Image
            src="/assets/ai/q-bank-v1.png"
            alt="ai-gen"
            width="100"
            height="100"
            className="relative overflow-hidden rounded-2xl"
          />
          <span>{t("Question Bank!")}</span>
        </CustomQuestionTabTitle>
        <Styled.Questionsflex>
          <Styled.QuestionsLabel>
            <select onChange={onChangeNumQuestion}>
              {NumOptions &&
                NumOptions.map((NumOption, index) => (
                  <Styled.StyledOption key={index} value={NumOption.value}>
                    {t("Number of Questions")}: {NumOption.label}
                  </Styled.StyledOption>
                ))}
            </select>
          </Styled.QuestionsLabel>
          <Styled.QuestionsLabel>
            <select onChange={onChangeCategory}>
              {Categories &&
                Categories.map((Category) => (
                  <Styled.StyledOption key={Category.id} value={Category.value}>
                    {Category.Label}
                  </Styled.StyledOption>
                ))}
            </select>
          </Styled.QuestionsLabel>
        </Styled.Questionsflex>
        <Styled.Questionsflex>
          <Styled.QuestionsLabel>
            <select onChange={onChangeDifficulty}>
              {DificultyOptions &&
                DificultyOptions.map((DificultyOption, index) => (
                  <Styled.StyledOption
                    key={index}
                    value={DificultyOption.value}
                  >
                    {DificultyOption.label}
                  </Styled.StyledOption>
                ))}
            </select>
          </Styled.QuestionsLabel>
          <Styled.QuestionsLabel>
            <select onChange={onChangeType}>
              {TypeOptions &&
                TypeOptions.map((TypeOption, index) => (
                  <Styled.StyledOption key={index} value={TypeOption.value}>
                    {TypeOption.label}
                  </Styled.StyledOption>
                ))}
            </select>
          </Styled.QuestionsLabel>
        </Styled.Questionsflex>
      </Styled.QuestionsGenerator>
      <div className="flex items-center justify-center gap-2 pb-2">
        <GenericButton
          backgroundcolor="#FF6F40"
          textcolor="#fff"
          variant="shadow"
          activebgcolor="#FF6F50"
          isdisabled={false}
          shape="10px"
          shadowcolor="#888"
          size="medium"
          onClick={generateQuestions}
        >
          {questionState.length === 0 ? t("Generate") : t("Add More")}
        </GenericButton>
        <GenericButton
          backgroundcolor="#433e7d"
          textcolor="#fff"
          variant="shadow"
          activebgcolor="#272358"
          isdisabled={false}
          shape="10px"
          shadowcolor="#888"
          size="medium"
          onClick={addAllQuestions}
          hidden={selectAllShow}
        >
          {t("Select All")}
        </GenericButton>
      </div>
      <Styled.QuestionsGeneratorResults>
        <CustomLoader isLoading={isLoading}>
          {questions &&
            questions.map((QR, index) => (
              <Styled.QuestionsDetails key={index}>
                <div>
                  <Styled.Question>
                    <div dangerouslySetInnerHTML={{ __html: QR.question }} />
                  </Styled.Question>
                  <Styled.IncorrectAnswers>
                    {QR.incorrect_answers.map((incorrectAnswer, i) => (
                      <Styled.IncorrectAnswer key={i}>
                        {incorrectAnswer} <ImCross size={15} />
                      </Styled.IncorrectAnswer>
                    ))}
                    <Styled.CorrectAnswer>
                      {QR.correct_answer} <FaCheckCircle size={20} />
                    </Styled.CorrectAnswer>
                  </Styled.IncorrectAnswers>
                  <Styled.QuestionsDetailCategories>
                    <Styled.QCategory>{QR.category}</Styled.QCategory>
                    <Styled.QType>{QR.type}</Styled.QType>
                  </Styled.QuestionsDetailCategories>
                </div>
                <div>
                  <Styled.SelectQuestion
                    type="checkbox"
                    checked={checkedItems[QR.questionId] || false}
                    name={QR.question}
                    value={QR.questionId}
                    onChange={(e) => addQuestion(e, QR)}
                  />
                </div>
              </Styled.QuestionsDetails>
            ))}
        </CustomLoader>
      </Styled.QuestionsGeneratorResults>
    </CustomModalWrapper>
  );
};
