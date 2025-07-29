import { useState, useEffect } from "react";

type TimerProp = {
  seconds: number;
};

export const QuestionTimer = ({ seconds }: TimerProp) => {
  const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;

  return (
    <>
      <div className="flex flex-col items-center justify-center pt-5">
        <svg width="50" height="50" viewBox="0 0 42 42">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                style={{ stopColor: "rgb(220,220,220)", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "rgb(255,240,245)", stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>

          <circle
            r="20"
            cx="21"
            cy="21"
            fill="url(#grad1)"
            stroke="grey"
            strokeWidth="2px"
            strokeDasharray="126"
            strokeLinecap="round"
          />
          <text y="29px" x="8px" fill="red" fontSize={"1.5em"}>
            {formattedSeconds}
          </text>
        </svg>
      </div>
    </>
  );
};
