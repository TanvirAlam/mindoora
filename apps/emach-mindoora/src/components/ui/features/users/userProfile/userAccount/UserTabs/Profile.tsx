import React, { useRef } from "react";
import { useSession } from "next-auth/react";
import { FaEdit } from "react-icons/fa";
import { GenericButton } from "~/ui/components/elements/Buttons/Button";
import { Avatar } from "~/styles/mixins.styled";
import { deleteAccount } from "./apiConnector/deleteAccount";

const Profile = () => {
  const { data: session } = useSession();
  const ref = useRef(null);

  const getAvater = () => {
    const Avater = session?.user?.image;
    return Avater === "MindooraAvater"
      ? `/assets/${session?.user?.image}.png`
      : session?.user?.image;
  };

  return (
    <div className="mt-4 flex flex-col rounded-lg p-4 shadow-sm">
      <div className="relative">
        <div className="relative flex items-center justify-center gap-5">
          <Avatar
            avatar={getAvater}
            ref={ref}
            className="img-rotate-button flex items-center justify-center"
          >
            <FaEdit className="absolute z-50" size={25} />
            <div className="img outer ring" />
            <div className="img center ring" />
            <div className="img inner ring" />
          </Avatar>
        </div>
        <div className="w-full">
          <div className="flex justify-between gap-2">
            <div className="mt-4 w-full">
              <label className="text-white" htmlFor="name">
                Name
              </label>
              <input
                placeholder="Your name"
                className="w-full rounded-md border-gray-700 bg-gray-800 px-2 py-3 text-white"
                value={session?.user?.name}
                type="text"
                readOnly
              />
            </div>
            <div className="mt-4 w-full">
              <label className="flex gap-2 text-white" htmlFor="name">
                Avatar Name <FaEdit className="z-50" size={20} />
              </label>
              <input
                placeholder="Your name"
                className="w-full rounded-md border-gray-700 bg-gray-800 px-2 py-3 text-white"
                value={""}
                type="text"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="text-white" htmlFor="email">
              Email
            </label>
            <input
              placeholder="Your email"
              className="w-full rounded-md border-gray-700 bg-gray-800 px-2 py-3"
              type="text"
              value={session?.user?.email}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <label className="flex gap-2 text-white" htmlFor="address">
          Address (optional) <FaEdit className="z-50" size={20} />
        </label>
        <textarea
          placeholder="Your address"
          className="w-full py-2 rounded-md border-gray-700 bg-gray-800 px-2 text-white"
          id="address"
        ></textarea>
      </div>

      <div className="mt-4 flex flex-row space-x-2">
        <div className="flex-1">
          <label className="flex gap-2 text-white" htmlFor="city">
            City (optional) <FaEdit className="z-50" size={20} />
          </label>
          <input
            placeholder="Your city"
            className="w-full rounded-md border-gray-700 bg-gray-800 px-2 py-3 text-white"
            id="city"
            type="text"
          />
        </div>

        <div className="flex-1">
          <label className="flex gap-2 text-white" htmlFor="state">
            State (optional) <FaEdit className="z-50" size={20} />
          </label>
          <input
            placeholder="Your state"
            className="w-full rounded-md border-gray-700 bg-gray-800 px-2 py-3 text-white"
            id="state"
            type="text"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-row space-x-2">
        <div className="flex-1">
          <label className="flex gap-2 text-white" htmlFor="zip">
            ZIP (optional) <FaEdit className="z-50" size={20} />
          </label>
          <input
            placeholder="Your ZIP code"
            className="w-full rounded-md border-gray-700 bg-gray-800 px-2 py-3 text-white"
            id="zip"
            type="text"
          />
        </div>

        <div className="flex flex-row space-x-2">
          <div className="flex-1">
            <label className="flex gap-2 text-white" htmlFor="country">
              Country (optional) <FaEdit className="z-50" size={20} />
            </label>
            <select
              className="w-full rounded-md border-gray-700 bg-gray-800 px-2 py-3 text-white"
              id="country"
            >
              <option value="">Select a country</option>
              <optgroup label="Africa">
                <option value="AF">Afghanistan</option>
                <option value="DZ">Algeria</option>
                <option value="AO">Angola</option>
                ...
                <option value="ZW">Zimbabwe</option>
              </optgroup>
              <optgroup label="Asia">
                <option value="AM">Armenia</option>
                <option value="AZ">Azerbaijan</option>
                <option value="BH">Bahrain</option>
                ...
                <option value="YE">Yemen</option>
              </optgroup>
              <optgroup label="South America">
                <option value="AR">Argentina</option>
                <option value="BO">Bolivia</option>
                <option value="BR">Brazil</option>
                ...
                <option value="VE">Venezuela</option>
              </optgroup>
              ...
            </select>
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <GenericButton
          backgroundcolor="#FF4F40"
          textcolor="#fff"
          variant="shadow"
          activebgcolor="#FF6F50"
          isdisabled={false}
          shape="10px"
          shadowcolor="#888"
          size="medium"
          onClick={(e) => {
            e.preventDefault();
            deleteAccount()
          }}
        >
          DELETE ACCOUNT
        </GenericButton>
        <GenericButton
          backgroundcolor="#FF4F40"
          textcolor="#fff"
          variant="shadow"
          activebgcolor="#FF6F50"
          isdisabled={false}
          shape="10px"
          shadowcolor="#888"
          size="medium"
        >
          SAVE
        </GenericButton>
      </div>
    </div>
  );
};

export default Profile;
