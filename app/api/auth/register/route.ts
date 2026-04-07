import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse({
    ...body,
    positionId: body.positionId ? Number(body.positionId) : undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid payload", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    return NextResponse.json({ message: "Email already exists" }, { status: 409 });
  }

  if (parsed.data.positionId) {
    const position = await prisma.position.findUnique({
      where: { id: parsed.data.positionId },
    });

    if (!position) {
      return NextResponse.json({ message: "Position not found" }, { status: 404 });
    }
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
      name: parsed.data.name,
      department: parsed.data.department,
      positionId: parsed.data.positionId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      department: true,
      positionId: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
