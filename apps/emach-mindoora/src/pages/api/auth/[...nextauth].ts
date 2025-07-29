import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import FacebookProvider from "next-auth/providers/facebook";
import InstagramProvider from "next-auth/providers/instagram";
import TwitterProvider from "next-auth/providers/twitter";
import Discord from "next-auth/providers/discord";
import {
  type User,
  type SessionCallbackParams,
} from "../../../types/type";
import { type NextAuthOptions } from "next-auth";
import { postMethod } from "../../../utils/api/postMethod";
import { endPoints } from "../../../utils/api/route";

const scopes = ["identify"].join(" ");

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 86400,
  },
  providers: [
    GoogleProvider({
      clientId: `${process.env.GOOGLE_ID}`,
      clientSecret: `${process.env.GOOGLE_SECRET}`,
    }),
    FacebookProvider({
      clientId: `${process.env.FACEBOOK_ID}`,
      clientSecret: `${process.env.FACEBOOK_SECRET}`,
    }),
    InstagramProvider({
      clientId: `${process.env.INSTAGRAM_ID}`,
      clientSecret: `${process.env.INSTAGRAM_SECRET}`,
    }),
    TwitterProvider({
      clientId: `${process.env.TWITTER_ID}`,
      clientSecret: `${process.env.TWITTER_SECRET}`,
    }),
    LinkedInProvider({
      clientId: `${process.env.LINKEDIN_ID}`,
      clientSecret: `${process.env.LINKEDIN_SECRET}`,
      authorization: {
        params: { scope: "openid profile email" },
      },
      issuer: "https://www.linkedin.com",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      profile(profile, tokens) {
        const defaultImage =
          "https://cdn-icons-png.flaticon.com/512/174/174857.png";
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture ?? defaultImage,
        };
      },
    }),
    Discord({
      clientId: `${process.env.DISCORD_CLIENT_ID}`,
      clientSecret: `${process.env.DISCORD_CLIENT_SECRET}`,
      authorization: { params: { scope: scopes } },
    }),
    CredentialsProvider({
      type: "credentials",
      credentials: {},
      async authorize(credentials: any) {
        if (!credentials.email || !credentials.password) {
          return null;
        }
        return { email: credentials.email, id: credentials.password };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any}) {
      if (user && (user.id || user.name)) {
        await postMethod(endPoints.auth.register, {
          name: user.name || "Not found",
          email: user.email,
          password: user.id || user.id,
          image: user.image || 'http://noimage.com',
          role: "Gamer",
          verified: true,
          trueCode: `${process.env.NEXT_PUBLIC_VERIFIED_SECRET}`
        })
          .then((res) => {
            const data: User = res.data;
            token.id = data.id;
            token.email = data.email;
            token.name = data.name;
            token.userType = data.registerId;
            token.image = data.image;
            token.accessToken = data.accessToken;
            token.verified = data.verified;
          })
          .catch(async (error) => {
            await postMethod(endPoints.auth.login, {
              email: user.email,
              password: user.id,
            })
              .then((res) => {
                const data: User = res.data;
                if (res.status === 200) {
                  token.id = data.id;
                  token.email = data.email;
                  token.name = data.name;
                  token.userType = data.registerId;
                  token.image = data.image;
                  token.accessToken = data.accessToken;
                  token.verified = data.verified;
                } else {
                  token.error = error.response.data.message;
                }
              })
              .catch((error) => {
                token.error = error.response.data.message;
              });
            token.error = error.response.data.message;
          });
      }
      return token;
    },
    async session({ session, token }: SessionCallbackParams) {
      if (token) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.userType = token.userType;
        session.user.image = token.picture
          ? token.picture
          : (token.image as string);
        session.user.accessToken = token.accessToken as string;
        session.user.error = token.error;
        session.user.verified = token.verified as boolean;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
