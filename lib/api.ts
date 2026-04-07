import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getDevSession } from "@/lib/dev-auth";

export async function requireAuth() {
  const devSession = getDevSession();

  if (devSession) {
    return { error: null, session: devSession };
  }

  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }

  return { error: null, session };
}

export async function requireAdmin() {
  const result = await requireAuth();

  if (result.error) {
    return result;
  }

  if (result.session?.user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ message: "Forbidden" }, { status: 403 }),
      session: null,
    };
  }

  return result;
}
