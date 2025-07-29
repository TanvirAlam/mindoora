import Link from "next/link";
import React from "react";
import ScrollContainer from "react-indiana-drag-scroll";

export const UserWrapper = ({ title, child }) => {
  return (
    <div className="h-full pt-6 text-white">
      <div className="flex items-center justify-between my-3">
        <h1 className="font-mono text-2xl text-black font-bold">{title}</h1>
      </div>
      <ScrollContainer hideScrollbars={false}>{child}</ScrollContainer>
    </div>
  );
};
