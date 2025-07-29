import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { faker } from "@faker-js/faker";
import { Styled } from "~/components/ui/features/Invite/Invite.styled";
import ReactCodeInput from "react-verification-code-input";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import { useSession } from "next-auth/react";

const GameInvite = () => {
  const session = useSession();
  const [name, setName] = useState<string>("");
  const [isName, setIsName] = useState<boolean>(false);
  const router = useRouter();
  const { id } = router.query as { id: string };
  const displayCode = id ? id.split("") : "";
  const [gameId, setGameId] = useState<string>("");
  const [isId, setIsId] = useState<boolean>(false);
  const [, setIsLoading] = useRecoilState(loadingRecoilState);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    id && session.data?.user && setName(session?.data?.user?.name);
  }, [session]);

  useEffect(() => {
    isName && router.push(`/game/${id}/${name}`);
  }, [isName]);

  useEffect(() => {
    if (isId) {
      router.push(`/game/${gameId}`);
    }
  }, [isId]);

  const handleName = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsName(true);
  };

  const enterGameCode = (gameCode) => {
    if (gameCode.length === 6) {
      setGameId(gameCode);
      setIsId(true);
    }
  };

  return (
    <div className="z-50 flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col rounded-md bg-white px-4 py-8 shadow-md sm:px-4 md:px-4 lg:px-10">
        <div className="self-center text-xl font-medium uppercase text-gray-800 sm:text-2xl">
          <img
            src={"/assets/mindoora.png"}
            width={300}
            height={300}
            alt="mindoora-logo"
          />
        </div>
        <div className="mt-10">
          <form action="#">
            {id && (
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="mb-1 text-xl tracking-wide text-gray-600 sm:text-xl"
                >
                  Name:
                </label>
                <Styled.inpBorder>
                  <input
                    placeholder="Your Name"
                    id="gamename"
                    type="text"
                    name="gameName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleName(e);
                      }
                    }}
                    className="input text-white"
                  />
                </Styled.inpBorder>
              </div>
            )}
            {!id && (
              <div className="mb-6 flex flex-col">
                <label
                  htmlFor="password"
                  className="mb-1 text-xl tracking-wide text-gray-600 sm:text-sm"
                >
                  Game code:
                </label>
                <div className="relative">
                  <div className="absolute left-0 top-0 inline-flex h-full w-10 items-center justify-center text-gray-400">
                    <span>
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                  </div>
                  <ReactCodeInput
                    fields={6}
                    values={displayCode}
                    onChange={enterGameCode}
                  />
                </div>
              </div>
            )}

            {id && (
              <div className="flex w-full">
                <button
                  type="button"
                  onClick={(e) => handleName(e)}
                  className="flex w-full items-center justify-center rounded bg-blue-600 py-2 text-sm text-white transition duration-150 ease-in hover:bg-blue-700 focus:outline-none sm:text-base"
                >
                  <span className="mr-2 uppercase">Join</span>
                  <span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default GameInvite;
