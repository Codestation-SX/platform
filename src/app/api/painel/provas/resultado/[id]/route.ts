import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Params) {
  const { id } = await params;

  const tentativa = await prisma.provaTentativa.findUnique({
    where: { id },
    include: {
      prova: {
        include: {
          perguntas: {
            include: {
              alternativas: true,
            },
            orderBy: {
              ordem: "asc",
            },
          },
        },
      },
      respostas: true,
    },
  });

  if (!tentativa) {
    return NextResponse.json(
      { error: "Tentativa não encontrada" },
      { status: 404 }
    );
  }

  const perguntas = tentativa.prova.perguntas;
  const totalPerguntas = perguntas.length;
  let totalAcertos = 0;
  let notaObtida = 0;

  for (const pergunta of perguntas) {
    const respostaAluno = tentativa.respostas.find(
      (r) => r.perguntaId === pergunta.id
    );
    const alternativaCorreta = pergunta.alternativas.find((a) => a.correta);

    if (
      alternativaCorreta &&
      respostaAluno?.alternativaId === alternativaCorreta.id
    ) {
      totalAcertos += 1;
      notaObtida += pergunta.valorNota; // ✅ soma a nota de cada pergunta correta
    }
  }

  const notaTotal = perguntas.reduce((acc, p) => acc + p.valorNota, 0);
  const percentualAcerto =
    notaTotal > 0
      ? Math.round((notaObtida / notaTotal) * 100)
      : 0;

  // ✅ usa o critério real da prova, não um valor fixo
  const aprovado =
    percentualAcerto >= tentativa.prova.percentualMinimoAprovacao;

  // ✅ persiste o resultado no banco
  await prisma.provaTentativa.update({
    where: { id },
    data: {
      percentualAcerto,
      aprovado,
      notaObtida,
      notaTotal,
      dataFim: tentativa.dataFim ?? new Date(), // garante que dataFim é preenchida
      status: tentativa.status === "EM_ANDAMENTO" ? "CONCLUIDA" : tentativa.status,
    },
  });

  return NextResponse.json({
    provaTitulo: tentativa.prova.titulo,
    notaPercentual: percentualAcerto,
    aprovado,
    totalPerguntas,
    totalAcertos,
    notaObtida,
    notaTotal,
  });
}