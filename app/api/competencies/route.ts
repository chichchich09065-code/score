import { NextResponse } from "next/server";

import { requireAdmin, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { competencySchema } from "@/lib/validators";

export async function GET() {
  const result = await requireAuth();

  if (result.error) {
    return result.error;
  }

  const competencies = await prisma.competency.findMany({
    include: {
      _count: {
        select: {
          positionCompetencies: true,
          evaluations: true,
        },
      },
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return NextResponse.json(competencies);
}

export async function POST(request: Request) {
  const result = await requireAdmin();

  if (result.error) {
    return result.error;
  }

  const body = await request.json();
  const parsed = competencySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid payload", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const competency = await prisma.competency.create({
    data: parsed.data,
  });

  return NextResponse.json(competency, { status: 201 });
}
