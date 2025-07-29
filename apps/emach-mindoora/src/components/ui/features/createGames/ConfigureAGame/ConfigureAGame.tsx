"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Styled } from "./ConfigureAGame.styled";
import { AddCoverPic } from "../AddCoverPic";
import { useGameConfigure } from "~/utils/gameCustomization/useGameConfigure";
import { faker } from "@faker-js/faker";
import { CreateButtonStyled } from "~/ui/components/elements/CreateButton/CreateButtonStyled";
import { AddKeywords } from "./AddKeywords";
import { GiArtificialIntelligence } from "react-icons/gi";
import { Categories } from "../../createGames/category.data";
import Image from "next/image";

const ConfigureAGame = () => {
  const { handleSubmit, onSubmit, register, setImage, setValue, totalTime } =
    useGameConfigure();
  const [customName, setCustomName] = useState<string>("");

  const generateNewName = (event?: ChangeEvent<HTMLInputElement>) => {
    event?.preventDefault();
    const newName = faker.internet.domainWord();
    setCustomName(newName);
    setValue("title", newName);
  };

  useEffect(() => {
    generateNewName();
  }, []);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomName(event.target.value);
    setValue("title", event.target.value);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center"
    >
      <AddCoverPic setImage={setImage} imageName="gameImage" />
      <Styled.QuestionCreationBox>
        <Styled.QuestionBox>
          <input
            type="text"
            name="title"
            id="title"
            value={customName}
            onChange={(e) => handleInputChange(e)}
          />
          <Styled.GenerateRandomName
            href="#"
            onClick={(e) => generateNewName(e)}
          >
            <GiArtificialIntelligence size={30} />
          </Styled.GenerateRandomName>
          <label className="font-bold">Title</label>
        </Styled.QuestionBox>
        <Styled.QuestionBoxTextArea>
          <label className="font-bold">
            Description <span>(optional)</span>
          </label>
          <textarea
            id="description"
            rows={10}
            cols={30}
            placeholder="Enter description"
            {...register("description")}
          ></textarea>
        </Styled.QuestionBoxTextArea>
        <Styled.QuestionBox>
          <label className="absolute mt-[-1rem] font-bold">
            Select Categories <span>(optional)</span>
          </label>
          <select
            name="categorySelector"
            onChange={(e) => setValue("category", e.target.value)}
          >
            {Categories.map((category, index) => (
              <option key={index} value={category.Label}>
                {category.Label}
              </option>
            ))}
          </select>
        </Styled.QuestionBox>
        <Styled.QuestionBox>
          <label className="absolute mt-[-1rem] font-bold">
            Visibiltity of Quiz <span>(optional)</span>
          </label>
          <select
            name="visibilitySelector"
            onChange={(e) =>
              setValue("isPublic", e.target.value === "true" ? true : false)
            }
          >
            <option value={"true"} selected>
              Public
            </option>
            <option value={"false"}>Private</option>
          </select>
        </Styled.QuestionBox>
        <Styled.QuestionBox>
          <label className="absolute mt-[-1rem] font-bold">
            Keywords <span>(optional)</span>
          </label>
          <AddKeywords setValue={setValue} />
        </Styled.QuestionBox>
        <Styled.QuestionBox>
          <CreateButtonStyled delay={totalTime}>
            <div className="flex items-center justify-center gap-2 font-bold text-white">
              <Image
                src={"/assets/create-game.png"}
                alt=""
                width="40"
                height="40"
              />
              {customName.length == 0 ? "GAME NAME NEEDED!" : "CREATE GAME"}
            </div>
          </CreateButtonStyled>
        </Styled.QuestionBox>
      </Styled.QuestionCreationBox>
    </form>
  );
};

export default ConfigureAGame;
