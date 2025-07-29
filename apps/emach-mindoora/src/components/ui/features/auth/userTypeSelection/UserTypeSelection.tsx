import React from "react";
import { Styled } from "../socialLogin/SocialLoginButton.styled";
import { userTypeData } from "./userTypeData";

const UserTypeSelection = () => {
  return (
    <Styled.AutoGridUserTypeUl>
      {userTypeData.map((item) => (
        <Styled.RadioInput key={item.id}>
          <input
            value={item.id}
            name="value-radio"
            id={item.id}
            type="radio"
            checked={item.checked}
          />
          <label htmlFor={item.id}>{item.label}</label>
        </Styled.RadioInput>
      ))}
    </Styled.AutoGridUserTypeUl>
  );
};

export default UserTypeSelection;
