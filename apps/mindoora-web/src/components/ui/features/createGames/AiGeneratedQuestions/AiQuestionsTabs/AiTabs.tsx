import Image from "next/image";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";

import "react-tabs/style/react-tabs.css";
import { GenerateQAiWords } from "../AiQuestionsTabContent/GenerateQAiWords";
import { GenerateQAiText } from "../AiQuestionsTabContent/GenerateQAiText";
import { GenerateQAiImage } from "../AiQuestionsTabContent/GenerateQAiImage";
import { GenerateQAiTextV2 } from "../AiQuestionsTabContent/GenerateQAiTextV2";
import { CustomQuestionTabTitle } from "~/styles/mixins.styled";

export const AiTabs = () => {
  return (
    <Tabs className="w-full">
      <CustomQuestionTabTitle>
        <Image
          src="/assets/ai/ai-gen.png"
          alt="ai-gen"
          width="100"
          height="100"
          className="relative overflow-hidden rounded-2xl"
        />
        <span>Create Questions using AI</span>
      </CustomQuestionTabTitle>
      <TabList>
        <Tab>
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/assets/ai/ai-tabs/ai-topic.png"
              alt=""
              width="25"
              height="20"
              className="lg:w-full"
            />
            <span className="whitespace-nowrap text-sm font-bold">
              Ai-Topic
            </span>
          </div>
        </Tab>
        <Tab>
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/assets/ai/ai-tabs/ai-text.png"
              alt=""
              width="25"
              height="20"
              className="lg:w-full"
            />
            <span className="whitespace-nowrap text-sm font-bold">Ai-Text</span>
          </div>
        </Tab>
        <Tab>
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/assets/ai/ai-tabs/ai-image.png"
              alt=""
              width="25"
              height="20"
              className="lg:w-full"
            />
            <span className="whitespace-nowrap text-sm font-bold">
              Ai-Image
            </span>
          </div>
        </Tab>
        <Tab>
          <div className="flex items-center justify-center gap-2">
            <Image
              src="/assets/ai/ai-tabs/ai-text.png"
              alt=""
              width="25"
              height="20"
              className="lg:w-full"
            />
            <span className="whitespace-nowrap text-sm font-bold">
              Ai-Text-v2
            </span>
          </div>
        </Tab>
      </TabList>

      <TabPanel>
        <GenerateQAiWords />
      </TabPanel>
      <TabPanel>
        <GenerateQAiText />
      </TabPanel>
      <TabPanel>
        <GenerateQAiImage />
      </TabPanel>
      <TabPanel>
        <GenerateQAiTextV2 />
      </TabPanel>
    </Tabs>
  );
};
