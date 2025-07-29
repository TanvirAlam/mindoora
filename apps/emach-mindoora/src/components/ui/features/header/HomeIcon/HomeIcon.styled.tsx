import styled from "@emotion/styled";
import { IoMdHome } from 'react-icons/io';

export const HomeButton = styled(IoMdHome)`
  position: absolute;
  color: #3c3c3c;
  transition: color 0.3s;
  font-size: 30px; 
  cursor: pointer;
  margin-left: 1.3rem;
  margin-top: -1rem;

  &:hover {
    color: #ff5e00;
  }
`;

export const Styled = {
  HomeButton,
};
