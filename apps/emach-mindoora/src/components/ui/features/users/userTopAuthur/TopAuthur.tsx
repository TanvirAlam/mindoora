import { useState, useEffect } from "react";
import { UserWrapper } from "../comWrapper";
import Image from "next/image";
import { apiSetup } from "~/utils/api/api";
import { endPoints } from "~/utils/api/route";
import { useSession } from "next-auth/react";
import FollowButton from "~/components/ui/elements/FollowButton/Follow";

const TopAuthur = () => {
  const [topAuthors, setTopAuthors] = useState([]);
  const { data: session } = useSession();
  const userId = session?.user.id;

  const fetch = async () => {
    const api = await apiSetup();
    try {
      const response = await api.get(endPoints.user.getTopAuthors);
      if (response.status === 201) {
        setTopAuthors(response.data.topPlayers);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    topAuthors && (
      <UserWrapper
        title={"Top Authers"}
        child={
          <div className="mt-4 flex flex-row items-center justify-between gap-8 pl-8 text-black">
            {topAuthors.map((player, index) => (
              <div key={index}>
                <div className="flex w-[200px] flex-col items-center justify-center gap-4">
                  <div>
                    <Image
                      src={player["user"]["image"] ?? "/assets/avatar.png"}
                      alt={player["user"]["name"]}
                      width={80}
                      height={80}
                      className="cursor-pointer rounded-full"
                      onClick={() =>
                        window.open(`/user/${player["id"]}`, "_blank")
                      }
                    />
                  </div>
                  <h6 className="text-sm font-bold">
                    {player["user"]["name"]}
                  </h6>
                  { userId !== player['user']["id"] &&
                  <FollowButton
                    followingId={player["id"]}
                    isFollowing={player["following"].length > 0}
                    fallBackFunction={fetch}
                  />
        }
                </div>
              </div>
            ))}
          </div>
        }
      ></UserWrapper>
    )
  );
};

export default TopAuthur;
