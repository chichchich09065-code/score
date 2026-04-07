import { NextResponse } from "next/server";

import { requireAdmin, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { positionSchema } from "@/lib/validators";

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
  const positionId = Number(id);

  if (Number.isNaN(positionId)) {
    return NextResponse.json({ message: "Invalid position id" }, { status: 400 });
  }

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: {
      positionCompetencies: {
        include: {
          competency: true,
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reports: {
        select: {
          id: true,
          title: true,
          status: true,
          submittedAt: true,
        },
      },
    },
  });

  if (!position) {
    return NextResponse.json({ message: "Position not found" }, { status: 404 });
  }

  return NextResponse.json(position);
}

export async function PATCH(request: Request, context: Context) {
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
  const parsed = positionSchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid payload", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const position = await prisma.position.update({
    where: { id: positionId },
    data: parsed.data,
  });

  return NextResponse.json(position);
}

export async function DELETE(_: Request, context: Context) {
  const result = await requireAdmin();

  if (result.error) {
    return result.error;
  }

  const { id } = await context.params;
  const positionId = Number(id);

  if (Number.isNaN(positionId)) {
    return NextResponse.json({ message: "Invalid position id" }, { status: 400 });
  }

  await prisma.position.delete({
    where: { id: positionId },
  });

  return NextResponse.json({ success: true });
}
