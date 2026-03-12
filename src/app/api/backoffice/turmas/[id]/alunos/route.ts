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
    const { userId, force } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      );
    }

    const turma = await prisma.turma.findFirst({
      where: { id: turmaId, status: "ATIVA" },
    });

    if (!turma) {
      return NextResponse.json(
        { error: "Turma não encontrada ou encerrada" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, turmaId: true, turma: { select: { nome: true } } },
    });

    if (!user) {
      return NextResponse.json({ error: "Aluno não encontrado" }, { status: 404 });
    }

    // Se aluno já está em outra turma e não foi confirmado, retorna conflito
    if (user.turmaId && user.turmaId !== turmaId && !force) {
      return NextResponse.json(
        {
          conflito: true,
          turmaNome: user.turma?.nome,
          message: `Este aluno já está na turma "${user.turma?.nome}". Caso prossiga, ele será transferido e não terá mais acesso aos vídeos da turma anterior.`,
        },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { turmaId },
      select: { id: true, firstName: true, lastName: true, email: true, turmaId: true },
    });

    return NextResponse.json(updatedUser);
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
