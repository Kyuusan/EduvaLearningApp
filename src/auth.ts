// auth.ts
import NextAuth from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth(authOptions);
 