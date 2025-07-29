import React, { useState, useEffect } from "react";
import { Styled } from "./GameScheduling.styled";
import { TweenMax, Elastic } from "gsap";

export const GameScheduling = ({ gameId }) => {
  const [secondHandFullCircles, setSecondHandFullCircles] = useState(0);

  useEffect(() => {
    const interval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const updateTime = () => {
    const timeNow = new Date();
    let seconds = timeNow.getSeconds();
    const minutes = timeNow.getMinutes();
    const hours = timeNow.getHours();

    if (seconds === 0) {
      setSecondHandFullCircles((prevCircles) => prevCircles + 1);
    }
    seconds += secondHandFullCircles * 60;

    TweenMax.to(".hour", 0.8, { rotation: 30 * hours, ease: Elastic.easeOut });
    TweenMax.to(".min", 0.8, { rotation: 6 * minutes, ease: Elastic.easeOut });
    TweenMax.to(".sec", 0.8, { rotation: 6 * seconds, ease: Elastic.easeOut });

    // Update the date if hours and minutes are both 0
    if (hours === 0 && minutes === 0) {
      updateDate();
    }
  };

  const addZero = (num) => {
    return num >= 0 && num < 10 ? "0" + num : num + "";
  };

  const updateDate = () => {
    const timeNow = new Date();
    const locale = "pt-pt";
    const day = addZero(timeNow.getDate());
    const month = timeNow.toLocaleString(locale, { month: "short" });
    const year = timeNow.getFullYear();

    document.querySelector(".day").innerHTML = day;
    document.querySelector(".month").innerHTML = month;
    document.querySelector(".year").innerHTML = year;
  };

  return (
    <Styled.GameSchadulingWrapper>
      <div className="block">
        <div className="cal">
          <div className="month">Feb</div>
          <div className="day">23</div>
          <div className="year">2024</div>
        </div>
        <div className="timer">
          <div className="timer__item sec"></div>
          <div className="timer__item min"></div>
          <div className="timer__item hour"></div>
        </div>
      </div>
    </Styled.GameSchadulingWrapper>
  );
};
