import { useState } from "react";
import { teamsData, personalData } from "./dummyData";
import { Chats } from "./chats";

const UserChat = () => {
  const [activeTab, setActiveTab] = useState("Teams");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <div className="sticky top-28 mb-4 mt-4 text-white">
      <h1 className="mt-4 text-2xl font-bold">Messages</h1>
      <div className="mt-4 h-full rounded-[2rem] bg-[#1A1648] p-2  md:mt-0 lg:ml-2">
        <div className="mt-4 flex w-full justify-center rounded-xl  bg-gradient-to-l from-[#3b3774] to-[#272358]  ">
          <button
            className={`${
              activeTab === "Teams"
                ? "border-b-2 border-white text-white transition-all"
                : "text-slate-400 transition-all"
            } w-[50%] rounded-s-2xl bg-transparent px-6 py-4 transition-all`}
            onClick={() => handleTabChange("Teams")}
          >
            Teams
          </button>
          <button
            className={`${
              activeTab === "Personal"
                ? "border-b-2 border-white text-white transition-all"
                : "text-slate-400 transition-all"
            } w-[50%] rounded-e-2xl bg-transparent px-6 py-4 transition-all`}
            onClick={() => handleTabChange("Personal")}
          >
            Personal
          </button>
        </div>
        {activeTab === "Teams" ? (
          <Chats chats={teamsData} />
        ) : (
          <Chats chats={personalData} />
        )}
      </div>
    </div>
  );
};

export default UserChat;
