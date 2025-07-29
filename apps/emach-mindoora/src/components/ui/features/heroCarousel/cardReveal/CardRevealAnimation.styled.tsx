import styled from "@emotion/styled";
import { size } from "~/ui/components/foundations/breakpoints/device";

const Page = styled.div`
  width: 100%;
  height: 100%;
`;

const Screen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  height: 105%;
  overflow-x: hidden;
  transition: 0.1s;
  margin: auto 0;
`;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  font-size: 6.25rem;
  font-weight: bold;
  letter-spacing: 0.125rem;
  margin: auto 0;
`;

const ContainerOne = styled(Container)`
  background: #4d297b;
  position: relative;
  overflow: hidden;
`;

const ContainerTwo = styled(Container)`
  background: radial-gradient(
    112.94% 110.97% at 66.94% 100%,
    #ebf0fc 0%,
    #eaf0fa 33.71%,
    #dfe9fe 72.17%,
    #e1dcfa 100%
  );
  position: relative;
  overflow: hidden;
`;

const TextOne = styled.div`
  color: white;
`;
const TextTwo = styled.span`
  color: #0d0f1b;
`;
export const Styled = {
  Page,
  Screen,
  ContainerOne,
  ContainerTwo,
  TextOne,
  TextTwo,
};
