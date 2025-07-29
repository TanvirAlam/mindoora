import React, { useState } from "react";
import { Styled } from "./AddKeywords.styled";

export const AddKeywords = ({ setValue }: { setValue: any }) => {
  const [tags, setTags] = useState([]);

  function handleKeyDown(e) {
    e.preventDefault();

    const value = e.target.value;
    if (!value.trim()) return;
    setTags((prev) => [...prev, value]);
    setValue("keyWords", [...tags, value]);
    e.target.value = "";
  }

  function removeTag(index) {
    setTags((prev) => prev.filter((tag, i) => i !== index));
    setValue(
      "keyWords",
      tags.filter((tag, i) => i !== index)
    );
  }

  return (
    <Styled.KeywordTagWrapper>
      {tags.map((tag, index) => (
        <div className="tag-item" key={index}>
          <span className="text">{tag}</span>
          <span className="close" onClick={() => removeTag(index)}>
            &times;
          </span>
        </div>
      ))}
      <input
        type="text"
        className="tags-input"
        placeholder="Type and press enter to add tags"
        onKeyDown={(e) => e.key === "Enter" && handleKeyDown(e)}
      />
    </Styled.KeywordTagWrapper>
  );
};
