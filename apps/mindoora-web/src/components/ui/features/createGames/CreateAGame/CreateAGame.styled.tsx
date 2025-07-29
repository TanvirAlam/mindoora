import styled from "styled-components";

const CustomRow = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  padding-right: 0.9375rem;
  margin-bottom: 1rem;
`;

const CustomCol = styled.div`
  flex: 1;
`;

const Tabs = styled.div`
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.25rem 0.25rem -0.125rem rgba(0, 0, 0, 0.5);
`;

const Tab = styled.div`
  color: white;
  overflow: hidden;
`;

const TabLabels = styled.label`
  display: flex;
  justify-content: space-between;
  padding: 1em;
  background: #7c5aa5;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    background: #1a252f;
  }

  &::after {
    content: "❯";
    width: 1em;
    height: 1em;
    text-align: center;
    transition: all 0.35s;
  }
`;

const TabContent = styled.div`
  max-height: 0;
  padding: 0 1em;
  color: #4d297b;
  background: white;
  transition: all 0.35s;
`;

const TabLabelInvite = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 1em;
  font-size: 0.75em;
  background: #4d297b;
  cursor: pointer;

  &:hover {
    background: #1a252f;
  }
`;

const RadioInput = styled.input`
  position: absolute;
  opacity: 0;
  z-index: -1;

  &:checked + ${TabLabels} {
    background: #4d297b;
  }

  &:checked + ${TabLabels}::after {
    transform: rotate(90deg);
  }

  &:checked ~ ${TabContent} {
    max-height: 100%;
    padding: 1em;
  }
`;

export const Styled = {
  CustomRow,
  CustomCol,
  Tabs,
  Tab,
  TabLabels,
  TabContent,
  TabLabelInvite,
  RadioInput,
};
