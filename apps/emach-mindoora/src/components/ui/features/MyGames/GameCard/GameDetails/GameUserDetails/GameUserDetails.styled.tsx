import { styled } from "styled-components";
import { size } from "~/ui/components/foundations/breakpoints/device";

const UserProfile = styled.div`
  background: #7c5aa5;
  border-radius: 4px;
  display: flex;
  flex-direction: row;
  border-radius: 25px;
  position: relative;
  color: #fff;

  h2 {
    margin: 0;
    padding: 0 1rem;
  }
  .card .title {
    padding: 1rem;
    text-align: right;
    color: green;
    font-weight: bold;
    font-size: 12px;
  }
  .card .desc {
    padding: 0.5rem 1rem;
    font-size: 12px;
  }
  .card .actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: center;
    padding: 0.5rem 1rem;
  }
  .card svg {
    width: 85px;
    height: 85px;
    margin: 0 auto;
  }

  .img-avatar {
    width: 80px;
    height: 80px;
    position: absolute;
    border-radius: 50%;
    border: 6px solid white;
    background-image: linear-gradient(-60deg, #16a085 0%, #f4d03f 100%);
    top: 15px;
    left: 150px;

    @media (max-width: ${size.md}) {
      left: 75px;
    }
  }

  .card-text {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }

  .title-total {
    padding: 2em 1.5em 1.5em 4em;
  }

  path {
    fill: white;
  }

  .img-portada {
    width: 100%;
  }

  .portada {
    width: 100%;
    height: 100%;
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    background-image: url("/assets/my-mindoora.png");
    background-position: bottom center;
    background-size: cover;
  }

  button {
    border: none;
    background: none;
    font-size: 24px;
    color: #8bc34a;
    cursor: pointer;
    transition: 0.5s;
    &:hover {
      color: #4caf50;
      transform: rotate(22deg);
    }
  }
`;

export const Styled = {
  UserProfile,
};
