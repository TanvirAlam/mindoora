import Image from "next/image";

export const WaitingForPlayers = () => {
  return (
    <div className="relative mb-20 flex justify-center">
      <Image
        src="/assets/waiting.webp"
        width="200"
        height="100"
        alt={"waitng"}
      />
      <div className="absolute bottom-0 text-white">
        Waiting For Players ...
      </div>
    </div>
  );
};
