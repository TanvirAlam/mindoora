import styled from "styled-components";

const FeedbackContainer = styled.div`
  width: clamp(18.75rem, 50vw, 35rem);
  padding: clamp(1rem, 2vw, 1.5rem);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100 !important;
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1rem;
`;

const Item = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
`;

const Emoji = styled.span`
  font-size: 2.5rem;
  filter: grayscale(100);
  cursor: pointer;
  transition: 0.3s;
  &:hover {
    filter: grayscale(0);
    font-size: 2.7rem;
    transition: 0.3s;
  }
`;

const Radio = styled.input`
  display: none;
  &:checked + ${Emoji} {
    filter: grayscale(0);
    transform: scale(1.2);
    transition: 0.3s;
  }
`;

export const Styled = { FeedbackContainer, Container, Item, Radio, Emoji };
