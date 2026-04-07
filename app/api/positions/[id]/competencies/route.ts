import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { positionCompetencySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  const result = await requireAdmin();

  if (result.error) {
    return result.error;
  }

  const { id } = await context.params;
  const positionId = Number(id);

  if (Number.isNaN(positionId)) {
    return NextResponse.json({ message: "Invalid position id" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = positionCompetencySchema.safeParse({
    competencyId: Number(body.competencyId),
    levelRequired: Number(body.levelRequired),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid payload", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [position, competency] = await Promise.all([
    prisma.position.findUnique({ where: { id: positionId } }),
    prisma.competency.findUnique({ where: { id: parsed.data.competencyId } }),
  ]);

  if (!position) {
    return NextResponse.json({ message: "Position not found" }, { status: 404 });
  }

  if (!competency) {
    return NextResponse.json({ message: "Competency not found" }, { status: 404 });
  }

  const link = await prisma.positionCompetency.upsert({
    where: {
      positionId_competencyId: {
        positionId,
        competencyId: parsed.data.competencyId,
      },
    },
    update: {
      levelRequired: parsed.data.levelRequired,
    },
    create: {
      positionId,
      competencyId: parsed.data.competencyId,
      levelRequired: parsed.data.levelRequired,
    },
    include: {
      competency: true,
      position: true,
    },
  });

  return NextResponse.json(link, { status: 201 });
}
