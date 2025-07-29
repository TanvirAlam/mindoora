import Image from "next/image";
import Points from "./points";
import Players from "./players";
import { useState } from "react";
import type { RefObject } from "react";

const VideoPlayer = ({
  videoRef,
}: {
  videoRef: RefObject<HTMLVideoElement>;
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleButtonClick = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      if (isPlaying) {
        videoElement.pause();
      } else {
        videoElement.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  return (
    <div className="flex h-full w-full items-center justify-between space-x-4 ">
      <div className="flex h-full w-full items-center justify-around">
        <div className="flex-col-center">
          <h1 className="text-base font-bold text-[#977C84]">Players</h1>
          <Players />
        </div>
        <div>
          <h1 className="text-base font-bold text-[#977C84]">Win</h1>
          <p className="text-sm">85%</p>
        </div>
      </div>
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-base font-bold text-[#977C84]">Score</h1>
        <Points />
      </div>
    </div>
  );
};

export default VideoPlayer;
