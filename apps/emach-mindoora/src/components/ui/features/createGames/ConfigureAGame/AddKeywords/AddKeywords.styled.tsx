import styled from "styled-components";

const KeywordTagWrapper = styled.div`
  padding-top: 0.9em;
  border-radius: 3px;
  width: min(80vw, 600px);
  margin-top: 1em;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5em;

  .tag-item {
    display: inline-block;
    padding: 0.5em 1em;
    border-radius: 20px;
    border: 2px solid #1a252f;
  }
  .tag-item .close {
    height: 20px;
    width: 20px;
    color: #1a252f;
    border-radius: 50%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin-left: 0.5em;
    font-size: 25px;
    cursor: pointer;

    &:hover {
      color: red;
    }
  }

  .tags-input {
    flex-grow: 1;
    padding: 0.5em 0;
    border: none;
    outline: none;
  }

  .text {
    color: #1a252f;
    font-weight: bold;
    font-size: 16px;
  }
`;

export const Styled = {
  KeywordTagWrapper,
};
