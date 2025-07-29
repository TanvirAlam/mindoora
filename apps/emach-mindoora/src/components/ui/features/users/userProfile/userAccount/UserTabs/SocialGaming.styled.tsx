import styled from "@emotion/styled";
import { baseTheme } from "~/ui/components/foundations/theming";

const SocialGaming = styled.div`
  .card {
    border-radius: 5px;
    margin-top: 10px;
    font-weight: 700;
    color: #fff;
  }

  form section {
    width: calc(50% - 30px);
    padding: 10px;
    margin: 10px;
    border-radius: 5px;
  }
  form section.left {
    float: left;
  }
  form section.right {
    float: right;
  }

  form .send-container {
    float: right;
    width: 100%;
    text-align: right;
    margin-right: 20px;
  }
  form .send-container input {
    background: #77bd7d;
    border: none;
    color: white;
    padding: 15px 30px;
    border-radius: 5px;
    font-size: 16px;
    cursor: pointer;
  }
  form .send-container input:hover {
    background: #8ed294;
  }
  form:after {
    content: "";
    display: block;
    clear: both;
  }
  @media (max-width: 992px) {
    form {
      padding: 0 5%;
    }
  }
  @media (max-width: 768px) {
    form {
      margin-bottom: 50px;
    }
    form section {
      width: 100%;
      margin: 0;
    }
    form section.left {
      margin-bottom: -30px;
    }
    form .send-container {
      margin-right: 0;
      margin-top: 15px;
    }
    form .send-container input {
      width: 100%;
    }
  }
`;

export const Styled = {
  SocialGaming,
};
