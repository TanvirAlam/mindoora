import React, { useEffect, useRef, useState } from "react";
import { Styled } from "./TimePicker.styled";
import { gsap, Power3 } from "gsap";

export const TimePicker = ({ dataString }: any) => {
  const timeScaleGroupRef = useRef(null);
  const dottedLineRef = useRef(null);
  const meridianLabelRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);

  useEffect(() => {
    const select = (s) => document.querySelector(s);
    const maxMinutes = 1440;
    const maxHours = 24;
    const timeScaleInterval = 60;
    const multiplier = 2;
    const timeScaleMarkers = 5;
    const maxDrag = maxMinutes * multiplier;
    const initTime = 12;

    gsap.set(timeScaleGroupRef.current, {
      width: maxDrag,
      left: timeScaleGroupRef.current.offsetWidth / 2,
    });
    const timeLabel = document.createElement("div");
    timeLabel.className = "timeLabel";

    const makeTimeScale = () => {
      let marker, labelGroup;

      for (let i = 0; i <= maxMinutes; i++) {
        marker = document.createElement("span");
        timeScaleGroupRef.current.appendChild(marker);

        const posX = i * multiplier;
        const minutesInHour = 60;

        if (i % timeScaleInterval === 0) {
          labelGroup = document.createElement("div");
          labelGroup.className = "timeLabel"; // Add class name to labelGroup
          labelGroup.innerHTML = `<span class="timeLabelBtn" data-btnId="${
            i / minutesInHour
          }"></span>`; // Include timeLabelBtn within labelGroup
          timeScaleGroupRef.current.appendChild(labelGroup);

          gsap.set(marker, {
            position: "absolute",
            bottom: 0,
            left: posX,
            height: 20,
            width: 1,
            flexShrink: 0,
            backgroundColor: "#fff",
          });

          gsap.set(labelGroup, {
            left: posX,
            bottom: 25,
            transform: "translateX(-50%)",
            position: "absolute",
          });

          labelGroup.querySelector(".timeLabelBtn").textContent = String(
            i / minutesInHour
          );
        } else if (i % (minutesInHour / 2) === 0) {
          gsap.set(marker, {
            position: "absolute",
            bottom: 0,
            left: posX,
            height: 15,
            width: 1,
            flexShrink: 0,
            backgroundColor: "#fff",
          });
        } else if (i % timeScaleMarkers === 0) {
          gsap.set(marker, {
            position: "absolute",
            bottom: 0,
            left: posX,
            height: 10,
            width: 1,
            flexShrink: 0,
            backgroundColor: "#fff",
          });
        } else {
          timeScaleGroupRef.current.removeChild(marker);
        }
      }
    };

    const roundDown = (floating) => {
      const rounded = Math.round(floating * 100) / 100;
      return rounded;
    };

    const dragUpdate = () => {
      const dragPosX = Math.round(
        gsap.getProperty(timeScaleGroupRef.current, "x") / multiplier
      );
      const numericTime = Math.abs((dragPosX / maxMinutes) * maxHours);
      let digitalMinutes = roundDown(
        (numericTime - Math.floor(numericTime)) * 60
      );
      const digitalHours = Math.floor(numericTime);
      let digitalTime = "";

      digitalMinutes = digitalMinutes === 60 ? "00" : digitalMinutes;
      digitalMinutes =
        digitalMinutes >= 0 && digitalMinutes < 10
          ? "0" + digitalMinutes
          : digitalMinutes;

      digitalTime = digitalHours + ":" + digitalMinutes;

      const diff = Math.abs(numericTime - Math.round(numericTime));

      gsap.to(dottedLineRef.current, {
        duration: 0.1,
        height: diff > 0.15 ? "40" : "15",
      });

      meridianLabelRef.current.textContent = digitalTime;
    };

    const init = () => {
      gsap.to(timeScaleGroupRef.current, {
        duration: 1,
        x: -initTime * (timeScaleInterval * multiplier),
        onUpdate: dragUpdate,
        ease: Power3.in,
      });
    };

    makeTimeScale();
    init();

    const timeLabelBtns = document.querySelectorAll(".timeLabelBtn");
    timeLabelBtns.forEach((el) => {
      el.addEventListener("click", function () {
        docClick(el);
      });
    });

    return () => {
      timeLabelBtns.forEach((el) => {
        el.removeEventListener("click", function () {
          docClick(el);
        });
      });
    };
  }, []);

  const docClick = (e) => {
    const btnId = Number(e.getAttribute("data-btnId"));
    gsap.to(timeScaleGroupRef.current, {
      duration: 0.5,
      x: -btnId * (60 * 2 * multiplier),
      onUpdate: dragUpdate,
      ease: Power3.in,
    });
  };

  useEffect(() => {
    const handleMouseDown = (event) => {
      setIsDragging(true);
      setStartX(event.clientX);
      setStartScrollLeft(timeScaleGroupRef.current.scrollLeft);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = (event) => {
      if (!isDragging) return;
      const deltaX = event.clientX - startX;
      timeScaleGroupRef.current.scrollLeft = startScrollLeft - deltaX;
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    timeScaleGroupRef.current.addEventListener("mousedown", handleMouseDown);

    return () => {
      timeScaleGroupRef.current.removeEventListener(
        "mousedown",
        handleMouseDown
      );
    };
  }, [isDragging, startX, startScrollLeft]);

  return (
    <Styled.TimeMain>
      <div ref={meridianLabelRef} className="meridianLabel">
        --:--
      </div>
      <div className="meridianLabelDate">{dataString}</div>
      <div className="timeBox">
        <div className="timeLabel">
          <span className="timeLabelBtn"></span>
        </div>
        <span ref={dottedLineRef} className="dottedLine"></span>
        <div
          ref={timeScaleGroupRef}
          className="timeScaleGroup"
          style={{ overflowX: "scroll", cursor: "grab" }}
        ></div>
      </div>
    </Styled.TimeMain>
  );
};
