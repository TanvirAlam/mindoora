import Image from "next/image";
import CountUp from "react-countup";

interface QuestionTrophyProps {
  questionTrophy: string;
  extraPoints: number;
}

export const QuestionTrophy: React.FC<QuestionTrophyProps> = ({
  questionTrophy,
  extraPoints,
}) => {
  return (
    <div className="absolute left-0 top-[400px] z-50 flex w-full flex-col items-center justify-center">
      <div className="flex animate-bounce flex-col items-center justify-center">
        <Image
          src={`/assets/trophies/` + questionTrophy + `.png`}
          width="100"
          height="100"
          alt="trophies"
        />
        <span className="hover:scale-x relative transform rounded-xl bg-[#41CE00] p-4 text-6xl font-semibold text-white shadow-[0_10px_20px_rgba(240,_46,_170,_0.7)] transition-all duration-300">
          <CountUp className="points" start={0} end={extraPoints} />
          <Image
            src={`/assets/bonus-points.png`}
            alt="bonus-points"
            width={200}
            height={100}
            className="absolute top-12"
          />
        </span>
      </div>
    </div>
  );
};
