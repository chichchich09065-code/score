import { NextResponse } from "next/server";

import { requireAdmin, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { competencySchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: Context) {
  const result = await requireAuth();

  if (result.error) {
    return result.error;
  }

  const { id } = await context.params;
  const competencyId = Number(id);

  if (Number.isNaN(competencyId)) {
    return NextResponse.json({ message: "Invalid competency id" }, { status: 400 });
  }

  const competency = await prisma.competency.findUnique({
    where: { id: competencyId },
    include: {
      positionCompetencies: {
        include: {
          position: true,
        },
      },
      evaluations: {
        select: {
          id: true,
          aiScore: true,
          aiMatchPercentage: true,
          reportId: true,
        },
      },
    },
  });

  if (!competency) {
    return NextResponse.json({ message: "Competency not found" }, { status: 404 });
  }

  return NextResponse.json(competency);
}

export async function PATCH(request: Request, context: Context) {
  const result = await requireAdmin();

  if (result.error) {
    return result.error;
  }

  const { id } = await context.params;
  const competencyId = Number(id);

  if (Number.isNaN(competencyId)) {
    return NextResponse.json({ message: "Invalid competency id" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = competencySchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid payload", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const competency = await prisma.competency.update({
    where: { id: competencyId },
    data: parsed.data,
  });

  return NextResponse.json(competency);
}

export async function DELETE(_: Request, context: Context) {
  const result = await requireAdmin();

  if (result.error) {
    return result.error;
  }

  const { id } = await context.params;
  const competencyId = Number(id);

  if (Number.isNaN(competencyId)) {
    return NextResponse.json({ message: "Invalid competency id" }, { status: 400 });
  }

  await prisma.competency.delete({
    where: { id: competencyId },
  });

  return NextResponse.json({ success: true });
}
