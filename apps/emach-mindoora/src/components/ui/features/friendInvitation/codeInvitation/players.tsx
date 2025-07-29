import { Players } from "~/types/type";
import FriendList from "~/components/ui/elements/friendList/friendList";

interface propsType {
  players: Players[];
}

const Players = ({ players }: propsType) => {
  return <FriendList players={players} />;
};

export default Players;
