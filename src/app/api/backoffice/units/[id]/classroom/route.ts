import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params; // ✅ AQUI

  const { classroomId } = await req.json();

  if (classroomId) {
    const exists = await prisma.classroom.findUnique({
      where: { id: classroomId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json({ error: "Turma inválida" }, { status: 400 });
    }
  }

  const unit = await prisma.unit.update({
    where: { id }, // ✅ AQUI
    data: { classroomId: classroomId ?? null },
    select: { id: true, title: true, classroomId: true },
  });

  return NextResponse.json(unit);
}
