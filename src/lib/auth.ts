import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      authorization: "https://github.com/login/oauth/authorize?scope=read:user+user:email+repo",
      // Map GitHub's profile fields to our User model fields.
      // The adapter uses this to create/update the User row —
      // no manual upsert needed in signIn callback anymore.
      profile(profile) {
        return {
          id: String(profile.id),
          githubId: String(profile.id),
          username: profile.login,
          name: profile.name ?? profile.login,
          email: profile.email,
          avatarUrl: profile.avatar_url,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.username = (user as typeof user & { username?: string }).username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
});

// Type augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username?: string | null;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    githubId?: string;
    username?: string;
    avatarUrl?: string;
  }
}