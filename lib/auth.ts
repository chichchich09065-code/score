import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";

import { authConfig } from "@/lib/auth.config";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(rawCredentials) {
      const credentials = credentialsSchema.safeParse(rawCredentials);

      if (!credentials.success) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.data.email },
      });

      if (!user?.password) {
        return null;
      }

      const isValid = await verifyPassword(credentials.data.password, user.password);

      if (!isValid) {
        return null;
      }

      return {
        id: String(user.id),
        email: user.email,
        name: user.name,
        role: user.role,
        positionId: user.positionId,
        department: user.department,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers,
});
