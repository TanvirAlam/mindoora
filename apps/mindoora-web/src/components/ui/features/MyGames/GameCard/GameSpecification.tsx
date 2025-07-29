import React from "react";
import Image from "next/image";
import { fredoka } from "~/components/ui/elements/fonts/mindooraFonts";

interface GameSpecificationProps {
  title: string;
  image: string;
  value: string | number;
}

export const GameSpecification = ({
  title,
  image,
  value,
}: GameSpecificationProps) => {
  return (
    <div className="feature flex items-center gap-2 font-bold text-[#4d297b]">
      <div className="flex gap-2">
        <Image src={image} alt={title} width={20} height={20} />
      </div>
      <span className={fredoka.className}>{value}</span>
    </div>
  );
};
