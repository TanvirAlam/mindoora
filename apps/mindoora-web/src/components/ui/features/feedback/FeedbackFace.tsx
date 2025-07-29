import React, { useState, useEffect, useRef } from "react";
import { Styled } from "./FeedbackFace.styled";

export const FeedbackFace = ({ defaultValue, min = 0, max = 100 }) => {
  const [value, setValue] = useState(defaultValue);
  const [percent, setPercent] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const calculatePercent = () => {
      const percentRaw = ((value - min) / (max - min)) * 100;
      setPercent(+percentRaw.toFixed(2));
    };

    calculatePercent();
  }, [value, min, max]);

  useEffect(() => {
    const maxHue = 120;
    const hueExtend = 30;
    const hue = Math.round((maxHue * percent) / 100);
    let hue2 = hue - hueExtend;
    if (hue2 < 0) hue2 += 360;
    const hues = [hue, hue2];

    // Set CSS variables
    const root = document.documentElement;
    root.style.setProperty("--percent", `${percent}%`);
    root.style.setProperty("--input-hue", hue);

    hues.forEach((h, i) => {
      root.style.setProperty(`--face-hue${i + 1}`, h);
    });

    // Set delays for animations
    const duration = 1;
    const delay = (-(duration * 0.99) * percent) / 100;
    const parts = ["right", "left", "mouth-lower", "mouth-upper"];
    parts.forEach((p) => {
      root.style.setProperty(`--delay-${p}`, `${delay}s`);
    });

    // Set aria label
    const faces = [
      "Sad face",
      "Slightly sad face",
      "Straight face",
      "Slightly happy face",
      "Happy face",
    ];
    let faceIndex = Math.floor((faces.length * percent) / 100);
    if (faceIndex === faces.length) --faceIndex;

    inputRef.current.setAttribute("aria-label", faces[faceIndex]);
  }, [percent]);

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <Styled.FeedbackFaceContainer>
      <form className="fr" action="">
        <label className="fr__label" htmlFor="face-rating">
          How was your experience?
        </label>
        <div className="fr__face" role="img" aria-label="Straight face">
          <div className="fr__face-right-eye" data-right></div>
          <div className="fr__face-left-eye" data-left></div>
          <div className="fr__face-mouth-lower" data-mouth-lower></div>
          <div className="fr__face-mouth-upper" data-mouth-upper></div>
        </div>
        <input
          ref={inputRef}
          className="fr__input"
          id="face-rating-input"
          value={value}
          type="range"
          min={min}
          max={max}
          step="0.1"
          onChange={handleInputChange}
        />
      </form>
    </Styled.FeedbackFaceContainer>
  );
};
