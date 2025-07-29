import React, { useState } from "react";
import { Styled } from "./Slider.styled";

export const Slider = ({ register }: { register: any }) => {
  const [value, setValue] = useState(4);

  const handleRangeChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
  };

  return (
    <Styled.SliderWrapper>
      <div className="valueHeading">
        Players <span>(optional)</span>
      </div>
      <div className="value">{value}</div>
      <input
        type="range"
        min="0"
        max="50"
        step="1"
        value={value}
        id="players"
        {...register("nPlayer")}
        onChange={handleRangeChange}
      />
    </Styled.SliderWrapper>
  );
};
