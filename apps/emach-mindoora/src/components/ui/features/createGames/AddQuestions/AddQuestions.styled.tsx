import styled from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";
import { BoxShadow } from "~/styles/mixins.styled";

const AddQuestionWrapper = styled.div`
  max-width: 100%;
  margin-right: auto;
  margin-left: auto;

  .col {
    padding: 1em;
    padding-bottom: 2rem;
    margin: 0 2px 2px 0;
    background: #fff;
    border-radius: 0.5em 0.5em 0.5em;
    ${BoxShadow}
  }

  .col-main {
    flex: 1;
  }

  .col-complementary {
    flex: 1;
  }

  @media only screen and (min-width: 640px) {
    .layout {
      display: flex;
      gap: 1rem;
    }
  }
`;

export const Styled = {
  AddQuestionWrapper,
};
