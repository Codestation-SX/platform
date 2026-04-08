import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Este endpoint deve ser chamado periodicamente (ex: Vercel Cron, cron-job.org)
// Configure em vercel.json:
// { "crons": [{ "path": "/api/cron/provas", "schedule": "0 * * * *" }] }

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");

  // Protege o endpoint com uma chave secreta
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const agora = new Date();

  // Busca provas ativas que já passaram da data fim
  const provasExpiradas = await prisma.prova.findMany({
    where: {
      status: "ATIVA",
      deletedAt: null,
      dataFimDisponibilidade: { lt: agora },
    },
    select: { id: true, titulo: true },
  });

  if (provasExpiradas.length === 0) {
    return NextResponse.json({ mensagem: "Nenhuma prova para encerrar." });
  }

  // Encerra todas as provas expiradas
  const ids = provasExpiradas.map((p) => p.id);

  await prisma.prova.updateMany({
    where: { id: { in: ids } },
    data: { status: "ENCERRADA" },
  });

  // Encerra tentativas que ainda estão em andamento nessas provas
  await prisma.provaTentativa.updateMany({
    where: {
      provaId: { in: ids },
      status: "EM_ANDAMENTO",
    },
    data: {
      status: "EXPIRADA",
      dataFim: agora,
    },
  });

  return NextResponse.json({
    mensagem: `${provasExpiradas.length} prova(s) encerrada(s).`,
    provas: provasExpiradas.map((p) => p.titulo),
  });
}