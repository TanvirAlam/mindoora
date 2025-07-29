import styled from "styled-components";

const ModalButtonDelete = styled.button`
  margin: 0 10px;
  padding: 8px 16px;
  cursor: pointer;
  background-color: #3498db;
  border: none;
  border-radius: 10px;
  color: #fff;
  font-weight: bold;
  font-size: 2rem;
`;

const ModalButtonCancel = styled(ModalButtonDelete)`
  background-color: #d52958;
`;

export const Styled = {
  ModalButtonDelete,
  ModalButtonCancel,
};
