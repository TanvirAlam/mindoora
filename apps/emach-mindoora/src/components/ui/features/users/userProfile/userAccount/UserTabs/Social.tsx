import React, { useEffect, useMemo, useState } from "react";
import { Styled } from "./Social.styled";
import type { Game } from "~/types/type";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { modalRecoilState } from "~/ui/components/utils/atoms/ModalState";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import Image from "next/image";
import { SocialGaming } from "./SocialGaming";
import { GameScheduling } from "~/components/ui/elements/social/GameScheduling";

const Social = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [, setIsLoading] = useRecoilState(loadingRecoilState);
  const [, setModalState] = useRecoilState(modalRecoilState);
  const router = useRouter();

  const fetch = async () => {
    try {
      const api = await apiSetup();
      const response = await api.get(`${endPoints.userGame.allpublic}`);
      if (response.status === 200) {
        setGames(response.data.result.games);
      }
    } catch (error: any) {
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataIfSessionExists = async () => {
    const session = await getSession();
    if (!session?.user) {
      await router.push("/");
    } else {
      fetch();
    }
  };

  const memoizedFetchData = useMemo(() => fetchDataIfSessionExists, []);

  useEffect(() => {
    memoizedFetchData();
  }, [memoizedFetchData]);

  const handleModalLoad = (event: any, modalComponent: any) => {
    event.preventDefault();
    setModalState({
      open: true,
      modalComponent: modalComponent,
    });
  };

  const openModalGameSocial = (e, qID) => {
    handleModalLoad(e, <SocialGaming gameId={qID} />);
  };

  return (
    <Styled.Container>
      <table className="responsive-table">
        <thead className="responsive-table__head">
          <tr className="responsive-table__row">
            <th className="responsive-table__head__title responsive-table__head__title--name">
              Title
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--status">
              Lang
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--types">
              Players
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--update">
              Created By
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--country">
              Questions
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--played">
              Played
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--played">
              Owner
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--played">
              Share
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--played">
              Invite
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--played">
              Scheduale
            </th>
            <th className="responsive-table__head__title responsive-table__head__title--played">
              Teams
            </th>
          </tr>
        </thead>
        <tbody className="responsive-table__body">
          <div className="responsive-table__body__content">
            {games?.map((game) => (
              <tr
                key={game.id}
                className="responsive-table__row"
                onClick={(e) => openModalGameSocial(e, game.id)}
              >
                <td className="responsive-table__body__text responsive-table__body__text--name">
                  <div className="flex flex-col items-center justify-center">
                    <Image
                      src={game.imgUrl || "/assets/game1.png"}
                      alt="game image"
                      className="rounded-full"
                      width={80}
                      height={80}
                    />
                    <span className="w-full text-xs">{game.title}</span>
                  </div>
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--status">
                  {game.language}
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--types">
                  {game.nPlayer}
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--update">
                  {game.createdAt}
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--country">
                  {game.nQuestions}
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--country">
                  {game.nRoomsCreated}
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--country">
                  {game.author}
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--country">
                  N/A
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--country">
                  N/A
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--country">
                  <GameScheduling gameId={game.id} />
                </td>
                <td className="responsive-table__body__text responsive-table__body__text--country">
                  N/A
                </td>
              </tr>
            ))}
          </div>
        </tbody>
      </table>
    </Styled.Container>
  );
};

export default Social;
