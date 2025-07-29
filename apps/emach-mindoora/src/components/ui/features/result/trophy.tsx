import Image from "next/image";
import { useViewportSize } from "~/ui/components/hooks/useViewportSize";
import { useEffect, useState } from "react";
import type { GameResult } from "~/types/type";
import { Styled } from "./trophy.styled";
import CountUp from "react-countup";

const Trophy = ({ result }: { result: GameResult[] }) => {
  const [screenSize, setScreenSize] = useState(0);
  const viewport = useViewportSize();

  useEffect(() => {
    setScreenSize(viewport.px);
  }, [viewport, screenSize]);

  useEffect(() => {
    const updateGraphBars = () => {
      document.querySelectorAll(".graph-bar").forEach((bar) => {
        const dataWidth = bar.dataset.value;
        bar.style.width = `${dataWidth}%`;
      });
    };

    updateGraphBars();
  }, []);

  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  const playersWithPercentage = result.map((player) => ({
    ...player,
    percentage: (player.rightAnswered / player.nQuestionSolved) * 100,
    color: randomColor,
  }));

  const findTopPlayers = (data) => {
    data.sort((a, b) => b.percentage - a.percentage);
    const topPlayers = data;
    const topPlayersWithWinnerAttribute = topPlayers.map((player, index) => ({
      ...player,
      winner: index === 0 ? "1" : index === 1 ? "2" : index === 2 ? "3" : "", // Assign ranking
    }));

    return topPlayersWithWinnerAttribute;
  };

  return (
    <Styled.TrophyWrapper>
      <Styled.BarGraph>
        <Styled.Graph>
          {findTopPlayers(playersWithPercentage).map((item, index) => (
            <Styled.GraphBarBack key={index}>
              <span className="graph-points">
                <span className="graph-points-label">Points:</span>{" "}
                <CountUp className="points" start={0} end={item.points} />
              </span>
              <li className="graph-bar" data-value={item.percentage}>
                {item.winner === "1" && (
                  <Image
                    src={"/assets/1st-place.png"}
                    alt="1st Place"
                    width={30}
                    height={40}
                  />
                )}
                {item.winner === "2" && (
                  <Image
                    src={"/assets/2nd-place.png"}
                    alt="2nd Place"
                    width={30}
                    height={40}
                  />
                )}
                {item.winner === "3" && (
                  <Image
                    src={"/assets/3rd-place.png"}
                    alt="3rd Place"
                    width={30}
                    height={40}
                  />
                )}
                <span className="graph-legend">{item.playerName}</span>
              </li>
            </Styled.GraphBarBack>
          ))}
        </Styled.Graph>
      </Styled.BarGraph>
    </Styled.TrophyWrapper>
  );
};

export default Trophy;
