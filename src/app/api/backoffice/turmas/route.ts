import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

async function assertAdmin(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== "admin") return false;
  return true;
}

export async function GET(req: NextRequest) {
  if (!(await assertAdmin(req)))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const turmas = await prisma.turma.findMany({
    where: { deletedAt: null },
    include: {
      _count: { select: { alunos: true, lessons: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(turmas);
}

export async function POST(req: NextRequest) {
  if (!(await assertAdmin(req)))
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await req.json();
    const { nome, descricao, dataInicio, dataFim } = body;

    if (!nome?.trim()) {
      return NextResponse.json(
        { error: "Nome da turma é obrigatório" },
        { status: 400 }
      );
    }

    if (!dataInicio) {
      return NextResponse.json(
        { error: "Data de início é obrigatória" },
        { status: 400 }
      );
    }

    const turma = await prisma.turma.create({
      data: {
        nome: nome.trim(),
        descricao: descricao?.trim() || null,
        dataInicio: new Date(dataInicio),
        dataFim: dataFim ? new Date(dataFim) : null,
      },
    });

    return NextResponse.json(turma, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar turma" },
      { status: 500 }
    );
  }
}
