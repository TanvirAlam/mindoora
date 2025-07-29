import { Styled } from "./MyGames.styled";
import { GameCard } from "./GameCard";
import type { Game } from "~/types/type";
import { CurationFilter } from "../../elements/searchInput";
import { useState } from "react";
import { useRouter } from "next/router";

export const MyGames = ({
  games,
  fetch,
  targetRef,
  pathName
}: {
  games: Game[];
  fetch: () => void;
  targetRef: any;
  pathName: string
}) => {
  const router = useRouter();
  const category = router.query?.category as string || "";
  const [stringValue, setStringValue] = useState(category);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const gamesLength = games.length;

  const filteredData = games.filter((item) =>
    Object.values(item).some(
      (value) =>
        typeof value === "string" &&
        value.toLowerCase().includes(stringValue.toLowerCase())
    )
  );

  const handleStringChange = (searchTerm: string) => {
    setStringValue(searchTerm);
  };

  const handleLoading = (itemId: string) => {
    setLoadingStates((prevLoadingStates) => ({
      ...prevLoadingStates,
      [itemId]: true,
    }));
    setTimeout(() => {
      setLoadingStates((prevLoadingStates) => ({
        ...prevLoadingStates,
        [itemId]: false,
      }));
    }, 1000); // Simulating loading delay with setTimeout
  };

  return (
    <Styled.Wrapper>
      <div className="sticky">
        <CurationFilter pathName={pathName} onStringChange={handleStringChange} stringValue={stringValue} />
      </div>
      <Styled.Feature>
        {filteredData.map((g, i) => (
          <Styled.Item key={g.id}>
            {loadingStates[g.id] && <div>Loading...</div>}
            <div
              ref={i === gamesLength - 6 ? targetRef : null}
              id={`target_${i + 1}`}
              onLoad={() => handleLoading(g.id)}
            />
            {!loadingStates[g.id] && <GameCard game={g} fetch={fetch} />}
          </Styled.Item>
        ))}
      </Styled.Feature>
    </Styled.Wrapper>
  );
};
