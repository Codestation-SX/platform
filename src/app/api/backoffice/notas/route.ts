import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const nomeAluno = searchParams.get("aluno") || "";

  const tentativas = await prisma.provaTentativa.findMany({
    where: {
      status: { in: ["CONCLUIDA", "ENCERRADA_POR_TEMPO", "REPROVADO_POR_FRAUDE"] },
      aluno: nomeAluno
        ? {
            OR: [
              { firstName: { contains: nomeAluno, mode: "insensitive" } },
              { lastName: { contains: nomeAluno, mode: "insensitive" } },
            ],
          }
        : undefined,
    },
    include: {
      aluno: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      prova: {
        select: { id: true, titulo: true, percentualMinimoAprovacao: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tentativas);
}