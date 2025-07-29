import styled from "@emotion/styled";
import { size } from "~/ui/components/foundations/breakpoints/device";

const FormWrapper = styled.div`
  background: radial-gradient(
    112.94% 106.97% at 66.94% 100%,
    #ebf0fc 0%,
    #eaf0fa 33.71%,
    #dfe9fe 72.17%,
    #e1dcfa 100%
  );
  display: flex;
  gap: 2rem;
  padding: 1rem;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  order: 2;
  z-index: 2;
  border-radius: 1rem 1rem 0 0;

  @media (min-width: ${size.lg}) {
    order: 1;
    margin: auto;
    border-radius: 0;
  }
`;

const DisplayImageWrapper = styled.div`
  order: 1;
  width: 100%;
  z-index: 1;
  @media (min-width: ${size.lg}) {
    order: 2;
  }
`;

export const Styled = {
  FormWrapper,
  DisplayImageWrapper,
};
