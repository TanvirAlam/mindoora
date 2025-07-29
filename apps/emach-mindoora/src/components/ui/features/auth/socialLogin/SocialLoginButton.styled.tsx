import styled from "styled-components";

const AutoGridUl = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  grid-auto-rows: 3.75rem;
  grid-gap: 3rem;
  counter-reset: item;
  padding-top: 2.125rem;
  width: 400px;
  justify-content: center;
  align-items: center;
  padding: 2rem;

  @media (max-width: 440px) {
    grid-template-columns: repeat(auto-fill, minmax(100%, 1fr));
    width: 300px;
    padding-left: 2.5rem;
    padding-right: 2.5rem;
    padding-top: 1rem;
    padding-bottom: 1.5rem;
  }
`;

const AutoGridUserTypeUl = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  grid-auto-rows: 1rem;
  grid-gap: 2em;
  width: 200px;
  padding-top: 1rem;
`;

const AutoGridLi = styled.li`
  border-radius: 0.3125rem;
  position: relative;
  background-position: center;
  background-size: cover;
  place-items: center;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: transform 0.5s;

  &:hover {
    box-shadow: inset 0.25rem 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.2),
      inset -0.25rem -0.25rem 0.375rem -0.0625rem rgba(255, 255, 255, 0.7),
      -0.0313rem -0.0313rem 0px rgba(255, 255, 255, 1),
      0.0313rem 0.0313rem 0px rgba(0, 0, 0, 0.15),
      0px 0.75rem 0.625rem -0.625rem rgba(0, 0, 0, 0.05);
    border: 0.0625rem solid rgba(0, 0, 0, 0.1);
    transform: translateY(0.5em);
  }

  img {
    transition: transform 0.5s;
  }

  &:hover img {
    transform: scale(0.6);
    fill: #333333;
  }
`;

const RadioInput = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: 10px;
  font-weight: 600;
  width: 100%;
  color: white;

  input[type="radio"] {
    display: none;
  }

  label {
    display: flex;
    align-items: center;
    padding: 10px;
    border: 1px solid #ccc;
    background-color: #212121;
    border-radius: 5px;
    margin-right: 12px;
    cursor: pointer;
    position: relative;
    transition: all 0.3s ease-in-out;

    &:before {
      content: "";
      display: block;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #fff;
      border: 2px solid #ccc;
      transition: all 0.3s ease-in-out;
    }
  }

  input[type="radio"]:checked + label:before {
    background-color: green;
    top: 0;
  }

  input[type="radio"]:checked + label {
    background-color: royalblue;
    color: #fff;
    border-color: rgb(129, 235, 129);
    animation: radio-translate 0.5s ease-in-out;
  }

  @keyframes radio-translate {
    0% {
      transform: translateX(0);
    }

    50% {
      transform: translateY(-10px);
    }

    100% {
      transform: translateX(0);
    }
  }
`;

export const Styled = {
  AutoGridUl,
  AutoGridUserTypeUl,
  AutoGridLi,
  RadioInput,
};
