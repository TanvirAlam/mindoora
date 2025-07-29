import { useRecoilState } from "recoil";
import { gameTypeRecoilState } from "~/utils/atom/questionTypes.atom";
import {
  initialFieldsRecoilState,
  initialFieldsRecoilStateTF,
  initialFieldsRecoilStateNoAns,
  intialState,
  initialStateNoAns,
  initialStateTF,
} from "~/utils/atom/initialFields.atom";
import { useTranslation } from "react-i18next";

export const QuestionTypes = () => {
  const [questionType, setQuestionType] = useRecoilState(gameTypeRecoilState);
  const [mulInputFields, setMulInputFields] = useRecoilState(
    initialFieldsRecoilState
  );
  const [tfInputFields, setTfInputFields] = useRecoilState(
    initialFieldsRecoilStateTF
  );
  const [noInputFields, setNoInputFields] = useRecoilState(
    initialFieldsRecoilStateNoAns
  );
  const { t } = useTranslation();

  const initialStates = {
    mul: mulInputFields,
    tf: tfInputFields,
    no: noInputFields,
  };

  const initialStatesDefault = {
    mul: intialState,
    tf: initialStateTF,
    no: initialStateNoAns,
  };

  const onTypeChange = (e) => {
    const { value } = e.target;
    setQuestionType(value);
    switch (value) {
      case "mul":
        setMulInputFields(initialStatesDefault.mul);
        break;
      case "tf":
        setTfInputFields(initialStatesDefault.tf);
        break;
      case "no":
        setNoInputFields(initialStatesDefault.no);
        break;
      default:
        break;
    }
  };

  return (
    <div className=" items-start gap-4 overflow-hidden rounded-md p-6">
      <p className="text-center font-mono text-sm font-black uppercase text-neutral-600">
        {t("Select type of answers!")}
      </p>
      <div className="flex items-center justify-between gap-4">
        <div className="relative mr-4 flex h-[50px] w-[50px] items-center justify-center">
          <input
            type="radio"
            id="radio"
            name="qType"
            value="mul"
            checked={questionType === "mul"}
            onChange={(e) => onTypeChange(e)}
            className="peer z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div className="absolute h-full w-full rounded-full bg-pink-100 p-2 shadow-sm shadow-[#00000050] ring-pink-400 duration-300 peer-checked:scale-110 peer-checked:ring-2">
            <img
              src="/assets/multipel-choice.png"
              width="100"
              height="100"
              alt="multipel-choice"
            />
          </div>
          <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-pink-200 duration-500 peer-checked:scale-[500%]"></div>
        </div>
        <div className="relative flex h-[50px] w-[50px] items-center justify-center">
          <input
            type="radio"
            id="radio"
            name="qType"
            value="tf"
            checked={questionType === "tf"}
            onChange={(e) => onTypeChange(e)}
            className="peer z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div className="absolute flex h-full w-full items-center justify-center rounded-full bg-gray-100 p-2 shadow-sm shadow-[#00000050] ring-gray-400 duration-300 peer-checked:scale-110 peer-checked:ring-2">
            <img
              src="/assets/true-false.png"
              width="100"
              height="100"
              alt="true-false"
            />
          </div>
          <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-gray-200 duration-500 peer-checked:scale-[500%]"></div>
        </div>
        <div className="relative hidden h-[50px] w-[50px] items-center justify-center">
          <input
            type="radio"
            id="radio"
            name="qType"
            value="no"
            checked={questionType === "no"}
            onChange={(e) => onTypeChange(e)}
            className="peer z-10 h-full w-full cursor-pointer opacity-0"
          />
          <div className="absolute flex h-full w-full items-center justify-center rounded-full bg-yellow-100 p-2 shadow-sm shadow-[#00000050] ring-yellow-400 duration-300 peer-checked:scale-110 peer-checked:ring-2">
            <img
              src="/assets/dont-know.png"
              width="50"
              height="100"
              alt="dont-know"
            />
          </div>
          <div className="absolute -z-10 h-full w-full scale-0 rounded-full bg-yellow-200 duration-500 peer-checked:scale-[500%]"></div>
        </div>
      </div>
    </div>
  );
};
