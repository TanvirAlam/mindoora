import Grid from "@mui/material/Grid";
import type { GameRoomQuestions } from "~/types/type";
import React, { useEffect, useState } from "react";
import { Styled } from "./playgroundQuestions.styled";

const SidebarPlayground = ({
  questions,
  qNumber,
}: {
  questions: GameRoomQuestions[];
  qNumber: number;
}) => {
  const [selected, setSelected] = useState<string>();
  const isAnswereRemained =
    questions.filter((q) => q.isAnswered === false).length !== 0;

  useEffect(() => {
    questions && setSelected(questions[qNumber]?.id);
  }, [qNumber, questions]);

  return (
    <Grid item lg={2}>
      <aside className="hidden pl-2 pt-10 text-white md:block">
        <div className="lg:block">
          <Styled.Checklist>
            {questions?.map((question, index) => (
              <>
                <input
                  value={question.id}
                  title="question"
                  disabled={question.isAnswered}
                  type="radio"
                  id={question.id}
                  key={index}
                  checked={isAnswereRemained && selected === question.id}
                />
                <label htmlFor={question.id}>
                  <div
                    dangerouslySetInnerHTML={{ __html: question.question }}
                  />
                </label>
              </>
            ))}
          </Styled.Checklist>
        </div>
      </aside>
    </Grid>
  );
};

export default SidebarPlayground;
