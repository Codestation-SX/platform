// /api/painel/lessons/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token || !token.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = token.role === "admin";

    // Admin vê todas as aulas sem restrição
    if (isAdmin) {
      const units = await prisma.unit.findMany({
        where: { deletedAt: null },
        orderBy: { order: "asc" },
        include: {
          lessons: {
            where: { deletedAt: null },
            orderBy: { order: "asc" },
          },
        },
      });
      return NextResponse.json(units);
    }

    // Busca o aluno com turma e status ativo
    const aluno = await prisma.user.findUnique({
      where: { id: token.id as string },
      select: { turmaId: true, ativo: true, turma: { select: { status: true } } },
    });

    // Aluno sem turma, inativo ou com turma encerrada não vê nenhuma aula
    if (!aluno?.turmaId || aluno.ativo === false || aluno.turma?.status !== "ATIVA") {
      return NextResponse.json([]);
    }

    // Aluno com turma vê somente as aulas da sua turma
    const units = await prisma.unit.findMany({
      where: {
        deletedAt: null,
        lessons: {
          some: {
            deletedAt: null,
            turmaId: aluno.turmaId,
          },
        },
      },
      orderBy: { order: "asc" },
      include: {
        lessons: {
          where: {
            deletedAt: null,
            turmaId: aluno.turmaId,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error("[GET /api/painel/lessons]", error);
    return NextResponse.json(
      { error: "Erro ao buscar aulas" },
      { status: 500 }
    );
  }
}
