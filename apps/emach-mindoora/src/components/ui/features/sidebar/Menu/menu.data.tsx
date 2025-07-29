import { AiOutlineSetting } from "react-icons/ai";
import { IoMdHome } from "react-icons/io";
import { FiPlusCircle } from "react-icons/fi";
import { HiViewGrid } from "react-icons/hi";
import { FaListUl } from "react-icons/fa";
import { GiPriceTag } from "react-icons/gi";

export const SidebarMenuOptions = [
  {
    label: "Home",
    icon: <IoMdHome size={40} />,
    route: "/home",
  },
  {
    label: "Discover",
    icon: <HiViewGrid size={40} />,
    route: "/portals",
  },
  {
    label: "Library",
    icon: <FaListUl size={35} style={{ marginLeft: 5 }} />,
    route: "/games",
  },
  {
    label: "Create",
    icon: <FiPlusCircle size={40} />,
    route: "/create",
  },
  {
    label: "Pricing",
    icon: <GiPriceTag size={40} />,
    route: "/pricing",
  },
  {
    label: "Settings",
    icon: <AiOutlineSetting size={40} />,
    route: "/users",
  },
];
