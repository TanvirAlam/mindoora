import React from "react";
import { useRecoilState } from "recoil";
import {
  initialFieldsRecoilState,
  initialFieldsRecoilStateTF,
  initialFieldsRecoilStateNoAns,
  intialState,
  initialStateNoAns,
  initialStateTF,
} from "~/utils/atom/initialFields.atom";
import { showCreateBtnState } from "~/utils/atom/showCreateBtn.atom";
import { Styled } from "./QuestionInputs.styled";
import Image from "next/image";
import { useEffect } from "react";

export const QuestionInputs: React.FC<{
  questionType: string;
  isEdit: boolean;
}> = ({ questionType, isEdit }) => {
  const initialStates = {
    mul: initialFieldsRecoilState,
    tf: initialFieldsRecoilStateTF,
    no: initialFieldsRecoilStateNoAns,
  };

  const initialStatesDefault = {
    mul: intialState,
    tf: initialStateTF,
    no: initialStateNoAns,
  };

  const [inputFields, setInputFields] = useRecoilState(
    initialStates[questionType]
  );
  const [, setShowCreateBtn] = useRecoilState(showCreateBtnState);

  useEffect(() => {
    if(!isEdit){
      setInputFields(initialStatesDefault[questionType]);
    }
    return () => {
      setShowCreateBtn(false);
    }
  }, []);

  const handleOptionChange = (event: any) => {
    const updatedQuestionsAnswer = inputFields.map((question) => {
      if (question.id === event.target.value) {
        return {
          ...question,
          ans: true,
        };
      }
      return {
        ...question,
        ans: false,
      };
    });
    setInputFields(updatedQuestionsAnswer);
    setShowCreateBtn(true);
  };

  const handleAddMore = (index: number) => {
    if (index + 1 !== 4) {
      setInputFields((prev) => [
        ...prev,
        { index: index + 1, id: "Q" + (index + 2), value: "", ans: false },
      ]);
    }
  };

  const handleRemove = async (index: number, isAuto = false) => {
    const updatedInputs = inputFields.filter((field) => field.index !== index);

    if (updatedInputs.length === 1) {
      setInputFields((prev) =>
        [
          !isAuto && { ...updatedInputs[0] },
          isAuto && updatedInputs[0].value !== "" && { ...updatedInputs[0] },
          { index: 5, id: "Q2", value: "", ans: false },
        ]
          .filter(Boolean)
          .map((field, i) => ({ ...field, index: i }))
      );
    } else {
      setInputFields(updatedInputs.map((field, i) => ({ ...field, index: i })));
    }
  };

  const handleInputChange = async (
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.value === "" && inputFields.length > 1) {
      handleRemove(index, true);
      return;
    }
    const newInputs = await inputFields.map((field) => {
      if (field.index === index) {
        return { ...field, [event.target.name]: event.target.value };
      }
      return field;
    });
    setInputFields((prev) => {
      return newInputs;
    });
  };

  return (
    <Styled.QuestionInputWrapper>
       {inputFields.map((field) => (
        <Styled.creatInputs key={field.index}>
          {questionType === "tf" || questionType === "no" ? (
            <Image
              src={
                field.value == "True"
                  ? "/assets/true.png"
                  : field.value == "False"
                  ? "/assets/false.png"
                  : field.img
              }
              alt={field.value}
              width={150}
              height={150}
            />
          ) : (
            <label>
              <input
                required
                type="text"
                name="value"
                className="input"
                value={field.value !== "" ? field.value : ""}
                onChange={async (e) => {
                  await handleInputChange(field.index, e);
                  field.index === inputFields[inputFields.length - 1]?.index &&
                    handleAddMore(
                      inputFields[inputFields.length - 1]?.index as number
                    );
                }}
              />
              {!field.value && <span>Start typing to add more!</span>}
            </label>
          )}
          {questionType !== "no" && field.value !== "" ? (
            <Styled.RadioForm>
              <input
                name="hopping"
                type="radio"
                id={field.id}
                value={field.id}
                checked={field.ans}
                onChange={handleOptionChange}
              />
              <label htmlFor={field.id}>
                <span></span>ANS
              </label>
              {field.ans && (
                <div className="worm">
                  <div className="worm__segment"></div>
                </div>
              )}
            </Styled.RadioForm>
          ) : (
            <div className="h-5 w-16"></div>
          )}
          {questionType !== "tf" &&
            questionType !== "no" &&
            field.index !== 0 &&
            field.value !== "" && (
              <Styled.deleteButton onClick={() => handleRemove(field.index)}>
                <svg
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    stroke-width="2"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                  ></path>
                </svg>
              </Styled.deleteButton>
            )}
        </Styled.creatInputs>
      ))}
    </Styled.QuestionInputWrapper>
  );
};
