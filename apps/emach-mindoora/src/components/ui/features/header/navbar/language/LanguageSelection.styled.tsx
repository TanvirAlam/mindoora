import styled from "@emotion/styled";

const HoverImage = styled.div`
  img {
    filter: hue-rotate(20deg);
  }

  &:hover {
    img {
      -webkit-filter: invert(30%) sepia(96%) saturate(4000%) hue-rotate(20deg);
      filter: invert(30%) sepia(96%) saturate(4000%) hue-rotate(20deg);
    }
  }
  &:active {
    img {
      -webkit-filter: invert(10%) sepia(96%) saturate(4000%) hue-rotate(20deg);
      filter: invert(10%) sepia(96%) saturate(4000%) hue-rotate(20deg);
    }
  }
`;

const DropDownContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  width: 9.5rem;
  top: 5rem;
  padding: 0.5rem;
  color: #fff;
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  background-color: rgba(17, 25, 40, 0.75);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.125);
`;

export const LanguageOption = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  padding: 14px 10px;
  transition: background-color 0.2s ease;

  &.selected {
    background-color: #202124;
  }
  &:hover {
    background-color: #696d7b;
  }
`;

export const Styled = {
  HoverImage,
  DropDownContainer,
  LanguageOption,
};
