import { styled } from "styled-components";

const SendContainer = styled.div`
  position: relative;
  left: 0;
  display: flex;
  justify-content: center;

  .container {
    width: 600px;
    margin: auto;
    border-radius: 10px;
  }
  .container .todo {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
    border-radius: 10px;
  }
  .container .add-email {
    width: 100%;
    border-bottom: 1px solid #ccc;
    padding: 2%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }
  .container .add-email input.addEmails {
    width: 95%;
    padding: 15px 10px;
    border: none;
    background-color: #f6f6f6;
    outline: none;
    border-radius: 5px;
  }
  .container .add-email .addBtn {
    position: absolute;
    height: 48px;
    width: 48px;
    cursor: pointer;
    text-align: center;
    color: #fff;
    background-color: #112031;
    border-radius: 50%;
    line-height: 48px;
    text-align: center;
    right: 3%;
    transition: transform 0.4s;
    padding: 10px;
  }
  .container .add-email .addBtn:hover {
    transform: rotate(180deg);
  }
  .container .list-emails {
    max-height: 200px;
    min-height: 200px;
    overflow-y: scroll;
    scroll-behavior: smooth;
  }
  .container .list-emails .empty-emails {
    text-align: center;
    display: block;
    font-size: 18px;
    color: #fff;
    font-weight: 700;
    padding: 25px;
    user-select: none;
  }
  .container .list-emails .email-input {
    position: relative;
    width: 100%;
    padding: 15px;
    border-bottom: 2px solid #ccc;
    cursor: pointer;
    overflow: hidden;
  }
  .container .list-emails .email-input:hover {
    background-color: #f2f1f1;
    transition: 0.3s;
    color: #000;
  }
  .container .list-emails .email-input .actions {
    position: absolute;
    right: -15%;
    top: 0;
    width: 8%;
    height: 100%;
    background-color: red;
    transition: 0.3s;
    display: flex;
    justify-content: space-between;
    align-items: center;

    svg {
      width: 50px;
      height: 50px;

      &:hover {
        color: pink;
      }
    }
  }

  .container .list-emails .email-input .actions i:hover {
    font-size: 19px;
  }
  .container .list-emails .email-input:hover .actions {
    right: 0;
  }
  .container .list-emails .email-input p {
    max-width: 80%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .container .emails-statis {
    width: 100%;
    height: 50px;
  }
  .container .emails-statis > div {
    width: 50%;
    padding: 15px;
    font-size: 15px;
    user-select: none;
  }
  .container .emails-statis > div span {
    color: #fff;
    padding: 2px 5px;
    border-radius: 3px;
  }
  .container .emails-statis .count {
    float: left;
  }
  .container .emails-statis .count span {
    background-color: #ff2442;
  }
  .container .emails-statis .completed {
    float: right;
    text-align: right;
  }
  .container .emails-statis .completed span {
    background-color: #3db2ff;
  }
`;

export const Styled = {
  SendContainer,
};
