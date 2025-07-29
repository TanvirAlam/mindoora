import styled from "styled-components";
import { BoxShadow } from "~/styles/mixins.styled";
import { AiFillWechat, AiFillCloseCircle } from "react-icons/ai";

const Floater = styled.div<{ chatToggle: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: fixed;
  bottom: 10px;
  right: 10px;
  width: ${(props) => (props.chatToggle ? `300px` : `60px`)};
  height: ${(props) => (props.chatToggle ? `550px` : `60px`)};
  transition: all 250ms ease-out;
  border-radius: ${(props) => (props.chatToggle ? `0` : `50%`)};
  opacity: 1;
  background: -moz-linear-gradient(
    -45deg,
    #183850 40%,
    #183850 50%,
    #192c46 50%,
    #22254c 75%,
    #22254c 100%
  );
  background: -webkit-linear-gradient(
    -45deg,
    #183850 0,
    #183850 25%,
    #192c46 50%,
    #22254c 75%,
    #22254c 100%
  );
  ${BoxShadow}

  &:focus {
    outline: 0;
    box-shadow: 0 0 3pt 2pt rgba(14, 200, 121, 0.3);
  }
`;

const Chat = styled.div<{ chatToggle: boolean }>`
  display: flex;
  flex-direction: column;
  position: absolute;
  opacity: ${(props) => (props.chatToggle ? `1` : `0`)};
  width: 100%;
  border-radius: 50%;
  transition: all 250ms ease-out;
  margin: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ChatHeader = styled.div`
  flex-shrink: 0;
  padding: 10px;
  display: flex;
  background: transparent;
`;

const Title = styled.span`
  flex-grow: 1;
  flex-shrink: 1;
  padding: 0 5px;
  display: flex;
  gap: 10px;
`;

const CrossButton = styled.div``;

const ChatIcon = styled(AiFillWechat)<{ chatToggle: boolean }>`
  opacity: ${(props) => (props.chatToggle ? `0` : `1`)};
`;
const CloseChat = styled(AiFillCloseCircle)`
  font-weight: bold;
  position: relative;
  top: -40px;
  color: #f7d4d4;

  &:hover {
    color: red;
    scale: 1.5;
  }
`;

export const Styled = {
  ChatIcon,
  Floater,
  Chat,
  ChatHeader,
  Title,
  CrossButton,
  CloseChat,
};
