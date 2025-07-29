import { useState } from "react";
import { Styled } from "../../ExisitingQuestions/ExistingQuestions.styled";
import { CustomLoader } from "~/ui/components/elements/GenericSpinner";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { questionRecoilState } from "~/utils/atom/gameQuestion.atom";
import toast from "react-hot-toast";
import { ImCross } from "react-icons/im";
import { FaCheckCircle } from "react-icons/fa";
import axios from "axios";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";

export const GenerateQAiText = () => {
  const [numQuestions, setNumQuestion] = useState("5");
  const [Type, setType] = useState("Any");
  const [questions, setQuestions] = useState([]);
  const [questionState, setQuestionState] = useRecoilState(questionRecoilState);
  const [checkedItems, setCheckedItems] = useState<{ [id: number]: boolean }>(
    {}
  );
  const [selectAllShow, setSelectAllShow] = useState(true);
  const [, setModalState] = useRecoilState(modalRecoilState);
  const [isLoading, setIsloading] = useState(false);
  const [Language, setLanguage] = useState("en");
  const [inputTopic, setInputTopic] = useState("");

  const onChangeNumQuestion = (event: { target: { value: any } }) => {
    setNumQuestion(event.target.value);
  };

  const onChangeLanguage = (event: { target: { value: any } }) => {
    setLanguage(event.target.value);
  };

  const handleTopicInput = (event: { target: { value: any } }) => {
    setInputTopic(event.target.value);
  };

  const closeQuestionModal = (event: any) => {
    event.preventDefault();
    setModalState({
      open: false,
      modalComponent: <></>,
    });
  };

  const generateQuestions = async () => {
    const api = await apiSetup();
    const baseURL = `https://ai.bulkbdsms.com/question_ft`;
    const params = {
      input_text: inputTopic,
    };

    setIsloading(true);

    try {
      if (inputTopic === "") {
        throw new Error("Topic is must.");
      }
      const response = await axios.post(baseURL, params);
      if (response.status === 200) {
        addQuestionId(response.data.results);
        api
          .post(endPoints.qInDb.create, response.data.results)
          .catch((err: any) => {
            console.log(err);
          });
      }
    } catch (error: any) {
      toast.error("Try Another Topic");
    }

    setIsloading(false);
  };

  const addQuestionId = (questions: any) => {
    const lastId =
      questionState.length > 0
        ? Math.max(...questionState.map((question) => question.questionId))
        : 0;
    const newQuestions = questions.map((question: any, index: number) => ({
      ...question,
      questionId: lastId + index + 1,
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
          qSource: "aiGen",
          qPoints: 1,
          qTrophy: "noimage"
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
      console.log(allIncorrectOptions);

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
          qSource: "aiGen",
          qPoints: 1,
          qTrophy: "noimage"
        });
      }
    });

    setQuestionState(newQuestionState);
    setSelectAllShow(true);
    setQuestions([]);
  };

  return (
    <>
      <Styled.QuestionsGenerator>
        <Styled.Questionsflex>
          <label>
            <textarea
              required
              placeholder=""
              className="input"
              onChange={handleTopicInput}
            />
            Write Text...
          </label>
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
          {questionState.length === 0 ? "GENERATE" : "GENERATE AGAIN"}
        </GenericButton>
        <GenericButton
          backgroundcolor="#FF6F40"
          textcolor="#fff"
          variant="shadow"
          activebgcolor="#FF6F50"
          isdisabled={false}
          shape="10px"
          shadowcolor="#888"
          size="medium"
          onClick={closeQuestionModal}
        >
          CLOSE
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
          Select all
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
    </>
  );
};
