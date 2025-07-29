import styled from "styled-components";
import { motion } from "framer-motion";
import { BoxShadow } from "~/styles/mixins.styled";

const iconPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex: 40px 0;
  margin-right: 20px;
`;

const textPlaceholder = styled.div`
  border-radius: 5px;
  width: 200px;
  height: 20px;
  flex: 1;
`;

const sidebarButton = styled.button`
  outline: none;
  border: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: pointer;
  position: absolute;
  top: 10px;
  left: 17px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  ${BoxShadow}
`;

const sidebarBackground = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 300px;
`;

const sidebarNav = styled(motion.nav)`
  position: absolute;
  top: 0px;
  left: 0;
  bottom: 0;
`;

const sidebarUL = styled(motion.ul)`
  padding: 25px;
  position: absolute;
  top: 70px;
  width: 230px;
`;

const sidebarLI = styled(motion.li)`
  list-style: none;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;

  svg {
    color: white;
  }
`;

export const Styled = {
  iconPlaceholder,
  textPlaceholder,
  sidebarButton,
  sidebarBackground,
  sidebarNav,
  sidebarUL,
  sidebarLI,
};
