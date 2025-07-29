import { socialData } from "./socialData";
import { Styled } from "./SocialLoginButton.styled";

const SocialLoginButton = ({handleSignIn}: any) => {

  return (
    <Styled.AutoGridUl>
      {socialData.map((item) => (
        <Styled.AutoGridLi
          key={item.id}
          onClick={(e) => handleSignIn(e, item.provider)}
        >
          <item.component>
            <item.socialButton text={item.provider} />
          </item.component>
        </Styled.AutoGridLi>
      ))}
    </Styled.AutoGridUl>
  );
};

export default SocialLoginButton;
