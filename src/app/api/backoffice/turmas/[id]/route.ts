import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

async function assertAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return !!(token && token.role === "admin");
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req)))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await context.params;

  const turma = await prisma.turma.findFirst({
    where: { id, deletedAt: null },
    include: {
      alunos: {
        where: { deletedAt: null, role: "student" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          ativo: true,
          createdAt: true,
        },
        orderBy: { firstName: "asc" },
      },
      _count: { select: { lessons: true } },
    },
  });

  if (!turma) {
    return NextResponse.json({ error: "Turma não encontrada" }, { status: 404 });
  }

  return NextResponse.json(turma);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req)))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await context.params;

  try {
    const body = await req.json();
    const { nome, descricao, status, dataInicio, dataFim } = body;

    const turma = await prisma.turma.update({
      where: { id },
      data: {
        ...(nome !== undefined && { nome: nome.trim() }),
        ...(descricao !== undefined && { descricao: descricao?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(dataInicio !== undefined && { dataInicio: new Date(dataInicio) }),
        ...(dataFim !== undefined && {
          dataFim: dataFim ? new Date(dataFim) : null,
        }),
      },
    });

    return NextResponse.json(turma);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar turma" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await assertAdmin(req)))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await context.params;

  try {
    await prisma.turma.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "ENCERRADA",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao encerrar turma" },
      { status: 500 }
    );
  }
}
