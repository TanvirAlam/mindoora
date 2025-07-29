import Image from "next/image";
import { parties } from "./data";
import Users from "./users";
import { Box } from "@mui/material";
import ScrollContainer from "react-indiana-drag-scroll";

const PartyHappening = () => {
  return (
    <div className="mt-4 w-full text-white">
      <h1 className="text-2xl font-bold">Party happening in your location</h1>
      <ScrollContainer hideScrollbars={false}>
        <Box
          display="flex"
          flexDirection={{ sm: "row" }}
          marginTop="1rem"
          gap="1rem"
          borderRadius="1rem"
        >
          {parties.map((party, index) => (
            <div
              key={index}
              className="relative h-[30rem] min-w-[18rem] rounded-[2rem]  bg-[#130f54] p-4"
            >
              <div className="absolute left-6 mt-4 h-20 w-1/3 rounded-2xl">
                <Image
                  fill
                  src={party.partyImage}
                  alt={party.partyName}
                  sizes="100vw"
                  className="rounded-2xl object-cover"
                />
              </div>
              <div className="mt-12 flex flex-col items-end">
                <h1 className="text-2xl font-bold">{party.partyName}</h1>
                <p className="text-2xl">{party.partyLocation}</p>
              </div>
              <Users users={party.users} />
            </div>
          ))}
        </Box>
      </ScrollContainer>
    </div>
  );
};

export default PartyHappening;
