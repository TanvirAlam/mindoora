import React, { useState } from "react";
import { Styled } from "./ShareButton.styled";
import { useCopyToClipboard } from "usehooks-ts";

export const ShareButton = ({ inviteUrl }: string) => {
  const [value, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyClick = () => {
    copy(inviteUrl)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <Styled.ShareButton onClick={handleCopyClick}>
        <Styled.SVGImage
          src="/assets/mindoora-short.png"
          alt="icon"
          className="filled"
        />
        <span>{isCopied ? "Copied!" : "Click to Copy!"}</span>
      </Styled.ShareButton>
    </div>
  );
};
