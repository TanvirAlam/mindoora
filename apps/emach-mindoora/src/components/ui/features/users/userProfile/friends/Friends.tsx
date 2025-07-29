import { personalData } from "../../userSection/dummyData";
import Image from "next/image";
import SearchFriend from "./SearchFriend";

const Friends = () => {
  return (
    <div className="rounded-[2rem] bg-[#1C1C4C] text-white">
      <div className="flex flex-col items-center justify-start gap-5 p-4">
        <SearchFriend />
        <div className="h-[300px] w-full overflow-auto">
          {personalData.map((chat, index) => (
            <div className="flex-row-center p-2" key={index}>
              <div className="relative mr-2 h-12 w-12">
                <Image
                  src={chat.image}
                  alt={chat.name}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="mr-2 text-white">{chat.name}</h3>
                  <p className="inline rounded-full border border-red-700 px-3 py-2 text-sm text-red-700">
                    Messages
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Friends;
