import { styled } from "styled-components";
import { BoxShadow } from "~/styles/mixins.styled";
import { AiFillCloseCircle } from "react-icons/ai";
import { BsFillMicMuteFill, BsFillMicFill } from "react-icons/bs";
import { FaMicrophoneAlt } from "react-icons/fa";

const AudioWrapper = styled.div<{ audioToggle: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: fixed;
  bottom: 80px;
  right: 10px;
  width: ${(props) => (props.audioToggle ? `300px` : `60px`)};
  height: ${(props) => (props.audioToggle ? `550px` : `60px`)};
  transition: all 250ms ease-out;
  border-radius: ${(props) => (props.audioToggle ? `0` : `50%`)};
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
  z-index: 99;
  ${BoxShadow}

  &:focus {
    outline: 0;
    box-shadow: 0 0 3pt 2pt rgba(14, 200, 121, 0.3);
  }
`;

const Audio = styled.div<{ audioToggle: boolean }>`
  display: flex;
  flex-direction: column;
  position: absolute;
  opacity: ${(props) => (props.audioToggle ? `1` : `0`)};
  width: 100%;
  border-radius: 50%;
  transition: all 250ms ease-out;
  margin: auto;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const AudioHeader = styled.div`
  flex-shrink: 0;
  padding: 10px;
  display: flex;
  background: transparent;
`;

const Title = styled.span`
  flex-grow: 1;
  flex-shrink: 1;
  padding: 0 5px;
`;

const CrossButton = styled.button`
  position: relative;

  &:hover {
    color: red;
    border-radius: 50%;
    cursor: pointer;

    ${BoxShadow}
  }
`;

const AudioIcon = styled(BsFillMicMuteFill)<{ audioToggle: boolean }>`
  opacity: ${(props) => (props.audioToggle ? `0` : `1`)};
`;
const CloseAudio = styled(AiFillCloseCircle)``;
const AudioIconOpen = styled(FaMicrophoneAlt)``;
const AudioBackground = styled.div`
  background: -webkit-linear-gradient(
    -45deg,
    #183850 0,
    #183850 25%,
    #192c46 50%,
    #22254c 75%,
    #22254c 100%
  );
`;

export const Styled = {
  AudioWrapper,
  Audio,
  AudioHeader,
  AudioIcon,
  AudioIconOpen,
  AudioBackground,
  Title,
  CloseAudio,
  CrossButton,
};
