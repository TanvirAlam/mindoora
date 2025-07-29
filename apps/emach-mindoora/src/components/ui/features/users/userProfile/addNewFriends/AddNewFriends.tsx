import { useEffect, useState } from "react";
import { Styled } from "./AddNewFriends.styled";
import Image from "next/image";
import { IoMdSend } from "react-icons/io";
import { MdDelete } from "react-icons/md";

const AddNewFriends = () => {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [numEmails, setNumEmails] = useState(0);
  const [numCompletedEmails, setNumCompletedEmails] = useState(0);

  useEffect(() => {
    calcNumEmails();
    calcFinishedEmails();
    checkEmails();
  }, [emails]);

  const calcNumEmails = () => {
    setNumEmails(emails.filter((email) => !email.completed).length);
  };

  const calcFinishedEmails = () => {
    setNumCompletedEmails(emails.filter((email) => email.completed).length);
  };

  const checkEmails = () => {
    const emailContainer = document.querySelector(".list-emails");
    if (emailContainer?.getElementsByClassName("email-input").length === 0) {
      const message = document.createElement("span");
      emailContainer.appendChild(message);
    } else {
      document.querySelector(".empty-emails")?.remove();
    }
  };

  const handleAddEmail = () => {
    if (!newEmail.trim()) return;

    if (emails.some((email) => email.text === newEmail)) {
      return;
    }

    const newEmailObject = {
      id: emails.length + 1,
      text: newEmail,
      completed: false,
    };

    setEmails([...emails, newEmailObject]);
    setNewEmail("");
  };

  const handleDeleteEmail = (emailId) => {
    const updatedEmails = emails.filter((email) => email.id !== emailId);
    setEmails(updatedEmails);
  };

  return (
    <div className="flex flex-col items-center rounded-[2rem] font-mono">
      <Styled.SendContainer>
        <div className="container">
          <div className="todo">
            <div className="add-email">
              <input
                type="email"
                className="addEmails text-black"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <IoMdSend className="addBtn" onClick={handleAddEmail} />
            </div>
            <Image
              src="/assets/friend_request.png"
              alt=""
              fill
              className="relative -z-10 flex items-center justify-center opacity-5"
            />
            <div className="list-emails">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className={`email-input flex justify-start text-white items-center${
                    email.completed ? "finished" : ""
                  }`}
                >
                  <Image
                    src={"/assets/mindoora-short.png"}
                    alt=""
                    width={50}
                    height={50}
                  />
                  <p className="detail pl-2">{email.text}</p>
                  <Image
                    src="/assets/email-sent.png"
                    alt=""
                    width={50}
                    height={50}
                  />
                  <span className="rounded-full bg-[red] p-2 text-sm font-bold">
                    PENDING
                  </span>
                  <div className="actions">
                    <MdDelete
                      className="deleteBtn"
                      onClick={() => handleDeleteEmail(email.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Styled.SendContainer>
    </div>
  );
};

export default AddNewFriends;
