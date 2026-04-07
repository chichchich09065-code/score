import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER";
      positionId: number | null;
      department: string | null;
      name: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "USER";
    positionId: number | null;
    department: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "USER";
    positionId?: number | null;
    department?: string | null;
    name?: string | null;
  }
}
