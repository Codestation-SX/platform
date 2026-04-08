import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ProvaService } from "@/services/prova/prova.service";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const [disponiveis, concluidas] = await Promise.all([
      ProvaService.listarDisponiveisParaAluno(token.sub),
      prisma.provaTentativa.findMany({
        where: {
          alunoId: token.sub,
          status: { in: ["CONCLUIDA", "ENCERRADA_POR_TEMPO", "REPROVADO_POR_FRAUDE", "EXPIRADA"] },
        },
        select: {
          id: true,
          status: true,
          percentualAcerto: true,
          aprovado: true,
          dataFim: true,
          prova: {
            select: {
              id: true,
              titulo: true,
              descricao: true,
              tempoDuracaoMinutos: true,
              percentualMinimoAprovacao: true,
            },
          },
        },
        orderBy: { dataFim: "desc" },
      }),
    ]);

    return NextResponse.json({ disponiveis, concluidas });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao listar provas disponíveis" },
      { status: 500 }
    );
  }
}
