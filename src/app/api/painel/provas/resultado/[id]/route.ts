import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Params) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const tentativa = await prisma.provaTentativa.findUnique({
    where: { id },
    include: {
      prova: {
        include: {
          perguntas: {
            include: { alternativas: true },
            orderBy: { ordem: "asc" },
          },
        },
      },
      respostas: true,
    },
  });

  if (!tentativa) {
    return NextResponse.json({ error: "Tentativa não encontrada" }, { status: 404 });
  }

  // Apenas o próprio aluno ou admin pode ver o resultado
  if (tentativa.alunoId !== token.sub && token.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  // Usa somente as perguntas que o aluno efetivamente respondeu
  // (caso a prova tenha sido editada e perguntas recriadas, evita mostrar questões erradas)
  const perguntasRespondidas = tentativa.prova.perguntas.filter((p) =>
    tentativa.respostas.some((r) => r.perguntaId === p.id)
  );

  let totalAcertos = 0;

  const gabaritoPerguntas = perguntasRespondidas.map((pergunta) => {
    const respostaAluno = tentativa.respostas.find((r) => r.perguntaId === pergunta.id);
    const alternativaCorreta = pergunta.alternativas.find((a) => a.correta);
    const acertou =
      !!alternativaCorreta && respostaAluno?.alternativaId === alternativaCorreta.id;

    if (acertou) totalAcertos += 1;

    return {
      id: pergunta.id,
      enunciado: pergunta.enunciado,
      ordem: pergunta.ordem,
      valorNota: pergunta.valorNota,
      acertou,
      alternativas: pergunta.alternativas.map((a) => ({
        id: a.id,
        texto: a.texto,
        correta: a.correta,
        selecionada: respostaAluno?.alternativaId === a.id,
      })),
    };
  });

  // Usa os valores já calculados e salvos durante a finalização da tentativa
  const percentualAcerto = Math.round(tentativa.percentualAcerto ?? 0);
  const aprovado = tentativa.aprovado ?? false;
  const notaObtida = tentativa.notaObtida ?? 0;
  const notaTotal = tentativa.notaTotal ?? 0;

  return NextResponse.json({
    provaTitulo: tentativa.prova.titulo,
    notaPercentual: percentualAcerto,
    aprovado,
    totalPerguntas: perguntasRespondidas.length,
    totalAcertos,
    notaObtida,
    notaTotal,
    perguntas: gabaritoPerguntas,
  });
}
