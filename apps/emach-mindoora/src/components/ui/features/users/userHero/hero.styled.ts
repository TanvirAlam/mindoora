import styled from "@emotion/styled";

const GlasmorphismCard = styled.div`
  width: 100%;
  position: absolute;
  background: #1f1b5150;
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  bottom: 0;
  height: 170px;

  .flex-col-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
`;

export const Styled = { GlasmorphismCard };
