import { styled } from "styled-components";

const Wrapper = styled.div`
  min-height: 100%;
  width: 100%;
  background-color: inherit;
  display: grid;
  grid-template-columns: 1fr;
  justify-content: center;
  align-items: center;
  padding-right: 1.25rem;

  .sticky {
    position: -webkit-sticky;
    position: sticky;
    top: 75px;
    background: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0.25rem 1.875rem rgba(0, 0, 0, 0.1);
    -webkit-backdrop-filter: blur(0.475rem);
    backdrop-filter: blur(0.475rem);
    -webkit-backdrop-filter: blur(0.475rem);
    border-radius: 20px;
    padding: 20px;
    font-size: 20px;
    z-index: 9;
    margin-bottom: 20px;
    width: 100%;
  }
`;

const Feature = styled.div`
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  grid-template-columns: repeat(auto-fit, minmax(40rem, 1fr));
  column-gap: 0.5rem;
`;

const Item = styled.div`
  margin: 0.5rem;
  color: white;
  text-transform: uppercase;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s;
`;

export const Styled = {
  Wrapper,
  Feature,
  Item,
};
