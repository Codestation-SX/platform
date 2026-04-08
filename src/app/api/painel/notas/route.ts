import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const tentativas = await prisma.provaTentativa.findMany({
    where: {
      alunoId: token.sub,
      status: {
        in: ["CONCLUIDA", "ENCERRADA_POR_TEMPO", "REPROVADO_POR_FRAUDE"],
      },
    },
    include: {
      prova: {
        select: { id: true, titulo: true, percentualMinimoAprovacao: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tentativas);
}