let socialData = [];

// Check if window is defined (i.e., if the code is running in a browser environment)
if (typeof window !== "undefined") {
  // Dynamically import modules to avoid errors in non-browser environments
  import(
    /* webpackChunkName: "social-login" */
    "reactjs-social-login"
  ).then(
    ({
      LoginSocialGoogle,
      LoginSocialFacebook,
      LoginSocialInstagram,
      LoginSocialTwitter,
    }) => {
      import("react-social-login-buttons").then(
        ({
          FacebookLoginButton,
          GoogleLoginButton,
          InstagramLoginButton,
          TwitterLoginButton,
        }) => {
          socialData = [
            {
              id: 1,
              image: "/socialmedia/colorgoogle.png",
              provider: "google",
              component: LoginSocialGoogle,
              socialButton: GoogleLoginButton,
            },
            {
              id: 2,
              image: "/socialmedia/colorfb.png",
              provider: "facebook",
              component: LoginSocialFacebook,
              socialButton: FacebookLoginButton,
            },
            {
              id: 3,
              image: "/socialmedia/colorinsta.png",
              provider: "instagram",
              component: LoginSocialInstagram,
              socialButton: InstagramLoginButton,
            },
            {
              id: 4,
              image: "/socialmedia/colortwitter.png",
              provider: "twitter",
              component: LoginSocialTwitter,
              socialButton: TwitterLoginButton,
            },
          ];
        }
      );
    }
  );
}

export { socialData };
