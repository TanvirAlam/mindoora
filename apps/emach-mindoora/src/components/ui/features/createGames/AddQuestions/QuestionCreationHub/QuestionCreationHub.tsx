import { Styled } from "./QuestionCreationHub.styled";
import { useRecoilState } from "recoil";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import Image from "next/image";
import { ExistingQuestions } from "../../ExisitingQuestions";
import { CreateQuestions } from "../../CreateQuestions";
import { CreateQuestionsUsingAI } from "../../AiGeneratedQuestions/CreateQuestionsUsingAI";
import Tooltip from "@mui/material/Tooltip";
import { useTranslation } from "react-i18next";

export const QuestionCreationHub = () => {
  const [, setModalState] = useRecoilState(modalRecoilState);
  const { t } = useTranslation();

  const handleModalLoad = (e: any, MC: any) => {
    e.preventDefault();
    setModalState({
      open: true,
      modalComponent: MC,
    });
  };

  return (
    <>
      <Styled.SubTitle>
        <p>Select Question Type</p>
      </Styled.SubTitle>
      <Styled.QuestionHubWrapper>
        <li className="pt-5">
          <a href="#" onClick={(e) => handleModalLoad(e, <CreateQuestions />)}>
            <span className="icon-home mr-12 md:mr-14">
              <Image
                src="/assets/ai/custom.png"
                alt=""
                width={130}
                height={100}
              />
            </span>
            <span className="relative z-50  pr-8 text-lg font-bold text-[#1A252F] md:pr-14 md:text-2xl lg:block">
              Custom
            </span>
          </a>
        </li>
        <li>
          <a
            href="#"
            onClick={(e) => handleModalLoad(e, <ExistingQuestions />)}
          >
            <span className="icon-home">
              <Image
                src="/assets/ai/q-bank-v1.png"
                alt=""
                width={130}
                height={100}
              />
            </span>
            <span className="relative z-50 pl-5 text-lg font-bold text-[#1A252F] md:pl-10 md:text-2xl lg:block">
              Question Bank
            </span>
          </a>
        </li>
        <li className="disabled-link">
          <a
            href="#"
            onClick={(e) => handleModalLoad(e, <CreateQuestionsUsingAI />)}
          >
            <span className="icon-home">
              <Image
                src="/assets/ai/ai-gen.png"
                alt=""
                width={130}
                height={100}
              />
            </span>
            <span className="relative z-50 pl-5 text-lg font-bold text-[#1A252F] md:pl-10 md:text-2xl lg:block">
              AI{" "}
              <span className="text-base text-gray-500">
                &#40; Coming Soon &#41;
              </span>
            </span>
          </a>
        </li>
      </Styled.QuestionHubWrapper>
    </>
  );
};
