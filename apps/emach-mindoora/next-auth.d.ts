import NextAuth, { DefaultUser } from "next-auth";

interface IUser extends DefaultUser {
        id?: number | null | undefined;
        userType: string;
        accessToken?: string | null | undefined;
        registerId: string;
        password: string;
        error: string;
        verified: boolean;
}

declare module "next-auth" {
  interface User extends IUser {}
  interface Session {
    user?: User;
  }
}
