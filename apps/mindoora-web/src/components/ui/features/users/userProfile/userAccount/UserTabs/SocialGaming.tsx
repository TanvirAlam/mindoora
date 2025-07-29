import React, { useState } from "react";
import { Styled } from "./SocialGaming.styled";
import { Calendar } from "~/components/ui/features/calendar";
import AddNewFriends from "../../addNewFriends/AddNewFriends";
import { WriteAEmailMessage } from "./WriteAEmailMessage";
import Image from "next/image";
import { ModalWrapper } from "~/styles/mixins.styled";

export const SocialGaming = ({ gameId }: string) => {
  const [date, setDate] = useState<any>(new Date());
  const [selectRange, setSelectRange] = useState<boolean>(false);

  return (
    <ModalWrapper>
      <Styled.SocialGaming>
        <div className="card bg-[url('/assets/bgImage.png')] bg-contain bg-center bg-no-repeat">
          <div className="pl-8">
            <h1 className="text-xl">Shachedual Your Game</h1>
            <span className="text-gray-400">Game Name: </span>
            <span className="text-gray-400">{gameId}</span>
          </div>
          <form action="">
            <section className="left">
              <Calendar
                date={date}
                setDate={setDate}
                selectRange={false}
                setSelectRange={undefined}
              />
            </section>
            <section className="right">
              <AddNewFriends />
              <WriteAEmailMessage />
            </section>
            <div className="send-container">
              <input type="submit" value="Shecadule" />
            </div>
          </form>
        </div>
      </Styled.SocialGaming>
    </ModalWrapper>
  );
};
