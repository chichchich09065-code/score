import type { NextAuthConfig } from "next-auth";

import { isDevAuthBypassEnabled } from "@/lib/dev-auth";

export const authConfig = {
  providers: [],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth: currentAuth, request }) {
      if (isDevAuthBypassEnabled) {
        return true;
      }

      const isLoggedIn = Boolean(currentAuth?.user);
      const isAuthPage = request.nextUrl.pathname.startsWith("/login");
      const isPublicHome = request.nextUrl.pathname === "/";

      if (isAuthPage || isPublicHome) {
        return true;
      }

      return isLoggedIn;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.positionId = user.positionId;
        token.department = user.department;
        token.name = user.name;
      }

      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as "ADMIN" | "USER";
        session.user.positionId = token.positionId as number | null;
        session.user.department = token.department as string | null;
        session.user.name = token.name ?? session.user.name ?? "";
      }

      return session;
    },
  },
} satisfies NextAuthConfig;
