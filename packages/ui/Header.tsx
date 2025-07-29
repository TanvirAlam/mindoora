import * as React from "react";

export const Header = ({ text }: { text: string }) => {
  return <h1 className={"bg-red-800"}>{text}</h1>;
};
