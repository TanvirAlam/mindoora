import Image from "next/image";
import { Styled } from "../userFindFriendsToPlay/FindFriendsToPlay.styled";
import { useSession } from "next-auth/react";
import { useRef } from "react";

export const Hero = () => {
  const { data: session } = useSession();
  const ref = useRef(null);

  const getAvater = () => {
    const Avater = session?.user?.image;
    return Avater === "MindooraAvater"
      ? `/assets/${session?.user?.image}.png`
      : session?.user?.image;
  };

  return (
    <div className="h-full w-full text-white">
      <Styled.HeroContentWrapper>
        <div className="flex w-full items-center justify-between gap-8 pl-8 pr-8">
          <div className="flex">
            <Styled.Avatar
              avatar={getAvater}
              ref={ref}
              className="img-rotate-button"
            >
              <div className="img outer ring" />
              <div className="img center ring" />
              <div className="img inner ring" />
            </Styled.Avatar>
            <div>
              <div className="text-bold font-mono text-xl font-bold">
                fantaz#458
              </div>
              <div className="flex gap-4 p-4">
                <div className="flex flex-col border-r-[0.05rem] border-gray-50 pr-4">
                  <span className="text-sm text-stone-400">Friends</span>
                  <span className="text-xl font-bold">120</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-stone-400">Played game</span>
                  <span className="text-xl font-bold">81</span>
                </div>
              </div>
            </div>
          </div>
          <Image
            src="/assets/my-mindoora.png"
            alt=""
            width={250}
            height={200}
            className="relative left-12 p-8"
          />
        </div>
      </Styled.HeroContentWrapper>
    </div>
  );
};
