import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

async function assertAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return !!(token && token.role === "admin");
}

// Vincular aluno à turma
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req)))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id: turmaId } = await context.params;

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    const turma = await prisma.turma.findFirst({
      where: { id: turmaId, deletedAt: null, status: "ATIVA" },
    });

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada ou encerrada" },
        { status: 404 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { turmaId },
      select: { id: true, firstName: true, lastName: true, email: true, turmaId: true },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao vincular aluno" },
      { status: 500 }
    );
  }
}

// Remover aluno da turma
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req)))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { turmaId: null },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao remover aluno da turma" },
      { status: 500 }
    );
  }
}
