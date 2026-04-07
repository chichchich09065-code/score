import { NextResponse } from "next/server";

import { getAppSession } from "@/lib/session";

export async function requireAuth() {
  const session = getAppSession();
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
