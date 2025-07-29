import Link from "next/link";
import { Styled } from "./Sidebar.styled";
import { useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { loadingRecoilState } from "~/utils/atom/loading.atom";
import {
  animatePageOut,
  animatePageIn,
} from "~/utils/animations/animationPage";

export const variants = {
  open: {
    y: 0,
    opacity: 1,
    display: "flex",
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    display: "none",
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

interface MenuItemProps {
  name: string;
  icon: SVGRectElement;
  route: string;
  more?: boolean;
  isExpend?: boolean;
}

const Item = ({ name, icon, route }: MenuItemProps) => {
  const router = useRouter();
  const [, setIsLoading] = useRecoilState(loadingRecoilState);

  return (
    <a
      className="flex flex-col items-center justify-center"
      onClick={() => {
        setIsLoading(true);
        animatePageOut(route, router);
      }}
    >
      <div className="flex flex-row">
        <div>{icon}</div>
        <div className="ps-3 pt-1 text-lg font-semibold text-white">{name}</div>
      </div>
    </a>
  );
};

export const MenuItem = ({ menuValue, i }) => {
  return (
    <Styled.sidebarLI
      variants={variants}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Item
        name={menuValue.label}
        icon={menuValue.icon}
        route={menuValue.route}
      />
    </Styled.sidebarLI>
  );
};
