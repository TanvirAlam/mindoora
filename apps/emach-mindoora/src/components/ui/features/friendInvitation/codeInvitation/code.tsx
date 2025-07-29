import { InviteModalWrapper } from "~/styles/mixins.styled";
import { Invite } from "../../Invite";

const Code = ({ inviteCode }: { inviteCode: string }) => {
  return (
    <InviteModalWrapper>
      <Invite inviteCode={inviteCode} />
    </InviteModalWrapper>
  );
};

export default Code;
