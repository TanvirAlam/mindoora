import { IoIosArrowForward } from "react-icons/io";
import { Styled } from "./QuickLink.styled";

const QuickLink = () => {
  return (
    <div className="m-4 flex-col text-white md:pl-12">
      <div className="flex flex-col">
        <h1 className="pb-3 font-bold lg:text-xl xl:text-2xl">Quick Links</h1>
        {LinkData.map((item: any, index: number) => (
          <a key={index} href={`${item.link}`} className="mt-4 flex flex-row">
            <IoIosArrowForward className="mr-2 mt-1 text-white" />
            <Styled.CustomLink>{item.name}</Styled.CustomLink>
          </a>
        ))}
      </div>
    </div>
  );
};

export default QuickLink;

const LinkData = [
  {
    name: "Home",
    link: "/home",
  },
  {
    name: "Discover",
    link: "/portals",
  },
  {
    name: "Library",
    link: "/games",
  },
  {
    name: "Create",
    link: "/create",
  },
];
