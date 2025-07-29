import Image from "next/image";
import { Box } from "@mui/material";

import { usersData } from "./data";
import ScrollContainer from "react-indiana-drag-scroll";
const Users = () => {
  return (
    <div className="mt-4 text-white">
      <h1 className="mb-4 text-2xl font-bold"> Popular player</h1>
      <ScrollContainer hideScrollbars={false}>
        <Box
          display="flex"
          flexDirection={{ sm: "row" }}
          flexWrap={{ xl: "wrap" }}
          gap={"1rem"}
        >
          {usersData.map((user) => (
            <div
              key={user.id}
              className="min-w-[6.4rem] rounded-full bg-[#18144C] p-4 md:h-auto 2xl:w-[7.8rem]"
            >
              <div className="relative h-32 overflow-hidden rounded-full p-4">
                <Image
                  fill
                  src={user.image}
                  alt={user.name}
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
              <h1 className="flex-row-center mt-2">{user.name}</h1>
              <p className="flex-row-center">{user.gameNo} Games</p>
              <div className="flex-row-center">
                <div className="relative h-4 w-4">
                  <Image
                    fill
                    src="/assets/fire.svg"
                    alt="fire icon"
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
                <p className="mx-1">{user.point}</p>
              </div>
            </div>
          ))}
        </Box>
      </ScrollContainer>
    </div>
  );
};

export default Users;
