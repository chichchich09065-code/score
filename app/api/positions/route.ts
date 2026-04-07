import { NextResponse } from "next/server";

import { requireAdmin, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { positionSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const result = await requireAuth();

  if (result.error) {
    return result.error;
  }

  const positions = await prisma.position.findMany({
    include: {
      positionCompetencies: {
        include: {
          competency: true,
        },
        orderBy: {
          competency: {
            name: "asc",
          },
        },
      },
      _count: {
        select: {
          users: true,
          reports: true,
        },
      },
    },
    orderBy: [{ department: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(positions);
}

export async function POST(request: Request) {
  const result = await requireAdmin();

  if (result.error) {
    return result.error;
  }

  const body = await request.json();
  const parsed = positionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid payload", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const position = await prisma.position.create({
    data: parsed.data,
  });

  return NextResponse.json(position, { status: 201 });
}
