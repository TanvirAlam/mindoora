import styled from "@emotion/styled";

const Wrapper = styled.div`
  background: linear-gradient(180deg, #272358 0%, #433e7d 100%), #191648;
  border-radius: 2rem;
  padding-right: 1rem;
`;

const GiftWrapper = styled.div`
  padding: 0.5rem;
  display: flex;
  flex-direction: row;
  @media (min-width: 90rem) {
    flex-direction: column;
  }
`;

const GiftCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #4d297b;
  border-radius: 0.575rem;
  gap: 0.576rem;
  padding: 0.5rem;
  min-width: 15rem;
  @media (min-width: 1024px) {
    min-width: 13rem;
  }
`;

const GradientBorder = styled.div`
  background: linear-gradient(
    140deg,
    transparent,
    transparent,
    transparent,
    #9f9bd1,
    #625e9a
  );
  padding: 0.05rem;
  border-radius: 0.575rem;
  margin: 0.5rem;
`;
export const Styled = {
  Wrapper,
  GiftWrapper,
  GiftCard,
  GradientBorder,
};
