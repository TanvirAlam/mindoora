import styled from "styled-components";

const ConfirmButton = styled.button`
  width: 50px;
  height: 50px;
  position: relative;
  border-radius: 50%;
  cursor: pointer;
  transition-duration: 0.3s;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.13);
  border: none;

  &:active {
    transform: scale(0.8);
  }

  &:hover {
    background-color: white;
  }
`;
const KickButton = styled(ConfirmButton)``;

const AutoGrid = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto;
  width: ${({ live }) => live? '400px' : '220px'};
  height: 220px;
  grid-gap: 50px;
`;

export const Styled = {
  ConfirmButton,
  KickButton,
  AutoGrid,
};
