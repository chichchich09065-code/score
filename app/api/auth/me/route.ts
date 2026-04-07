import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api";

export async function GET() {
  const result = await requireAuth();

  if (result.error) {
    return result.error;
  }

  return NextResponse.json(result.session?.user);
}
