import { ModalWrapper } from "~/styles/mixins.styled";
import AddNewFriends from "../userProfile/addNewFriends/AddNewFriends";
import Image from "next/image";

const InviteFriends = () => {
  return (
    <ModalWrapper>
      <Image
        src={"/assets/mindoora.png"}
        width={400}
        height={400}
        alt="mindoora-logo"
      />
      <AddNewFriends />
    </ModalWrapper>
  );
};

export default InviteFriends;
