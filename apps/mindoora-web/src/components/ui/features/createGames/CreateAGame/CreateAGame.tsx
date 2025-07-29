import { useState } from "react";
import { Styled } from "./CreateAGame.styled";
import ConfigureGame from "../ConfigureAGame/ConfigureAGame";
import AddQuestions from "../AddQuestions/AddQuestions";
import { useTranslation } from "react-i18next";

export const CreateAGame = () => {
  const [activeTab, setActiveTab] = useState("addQ");
  const { t } = useTranslation();

  const handleActiveTab = (e: { target: { value: any } }) => {
    setActiveTab(e.target.value);
  };

  const handleTabs = () => {
    setActiveTab("addC");
  };

  return (
    <Styled.CustomRow>
      <Styled.CustomCol>
        <Styled.Tabs>
          <Styled.Tab>
            <Styled.RadioInput
              type="radio"
              id="rd2"
              name="rd"
              value="addQ"
              checked={activeTab === "addQ"}
              onChange={(e: { target: { value: any } }) => handleActiveTab(e)}
            />
            <Styled.TabLabels htmlFor="rd2">
              {t("Create A Game")}
            </Styled.TabLabels>
            <Styled.TabContent>
              <AddQuestions onTabChange={handleTabs} />
            </Styled.TabContent>
          </Styled.Tab>
          <Styled.Tab>
            <Styled.RadioInput
              type="radio"
              id="rd1"
              name="rd"
              value="addC"
              checked={activeTab === "addC"}
              onChange={(e: { target: { value: any } }) => handleActiveTab(e)}
            />
            <Styled.TabLabels htmlFor="rd1">{t("Configure")}</Styled.TabLabels>
            <Styled.TabContent>
              <ConfigureGame />
            </Styled.TabContent>
          </Styled.Tab>
        </Styled.Tabs>
      </Styled.CustomCol>
    </Styled.CustomRow>
  );
};
