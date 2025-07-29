import { styled } from "styled-components";
import { BoxShadow } from "~/styles/mixins.styled";
import { AiFillCloseCircle } from "react-icons/ai";
import { IoMdNotifications } from "react-icons/io";

const Floater = styled.div<{ chatToggle: boolean }>`
  cursor: pointer;
  z-index: 2;
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
  border-radius: ${(props) => (props.chatToggle ? `10px` : `50%`)};
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

const Notification = styled.div<{ NotificationToggle: boolean }>`
  display: flex;
  flex-direction: column;
  position: absolute;
  opacity: ${(props) => (props.NotificationToggle ? `1` : `0`)};
  width: 100%;
  border-radius: 50%;
  transition: all 250ms ease-out;
  margin: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const NotificationHeader = styled.div`
  flex-shrink: 0;
  padding: 10px;
  display: flex;
  background: transparent;
`;

const Title = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const CrossButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 10px;
  top: 50px;
`;

const NotificationIcon = styled(IoMdNotifications)<{
  NotificationToggle: boolean;
}>`
  opacity: ${(props) => (props.NotificationToggle ? `0` : `1`)};
  position: relative;
`;

const CloseNotification = styled(AiFillCloseCircle)`
  font-weight: bold;
  position: relative;
  top: -40px;

  &:hover {
    color: red;
    scale: 1.5;
  }
`;

const NotificationQuantity = styled.div<{
  NotificationToggle: boolean;
}>`
  width: 15px;
  height: 15px;
  background: red;
  position: absolute;
  z-index: 999;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  font-weight: bold;
  top: 10px;
  right: 15px;
  opacity: ${(props) => (props.NotificationToggle ? `0` : `1`)};
`;

export const Styled = {
  NotificationIcon,
  Floater,
  Notification,
  NotificationHeader,
  Title,
  CrossButton,
  CloseNotification,
  NotificationQuantity,
};
