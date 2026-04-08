import {
  PERCENTUAL_MINIMO_APROVACAO,
  Pergunta,
  Prova,
  RespostaAluno,
  ValidacaoDisponibilidadeProva,
} from "@/types/prova";

export function arredondarDuasCasas(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function calcularNotaTotal(perguntas: Pergunta[]): number {
  return arredondarDuasCasas(
    perguntas.reduce((acc, pergunta) => acc + pergunta.valorNota, 0)
  );
}

export function obterAlternativaCorretaId(pergunta: Pergunta): string {
  const alternativaCorreta = pergunta.alternativas.find((alt) => alt.correta);

  if (!alternativaCorreta) {
    throw new Error(
      `A pergunta "${pergunta.id}" não possui alternativa correta definida`
    );
  }

  return alternativaCorreta.id;
}

export function contarAcertos(
  perguntas: Pergunta[],
  respostas: RespostaAluno[]
): number {
  return perguntas.reduce((acc, pergunta) => {
    const resposta = respostas.find((r) => r.perguntaId === pergunta.id);
    const alternativaCorretaId = obterAlternativaCorretaId(pergunta);

    if (resposta?.alternativaId === alternativaCorretaId) {
      return acc + 1;
    }

    return acc;
  }, 0);
}

export function contarErros(
  perguntas: Pergunta[],
  respostas: RespostaAluno[]
): number {
  return perguntas.reduce((acc, pergunta) => {
    const resposta = respostas.find((r) => r.perguntaId === pergunta.id);
    const alternativaCorretaId = obterAlternativaCorretaId(pergunta);

    if (
      resposta?.alternativaId &&
      resposta.alternativaId !== alternativaCorretaId
    ) {
      return acc + 1;
    }

    return acc;
  }, 0);
}

export function contarBrancos(
  perguntas: Pergunta[],
  respostas: RespostaAluno[]
): number {
  return perguntas.reduce((acc, pergunta) => {
    const resposta = respostas.find((r) => r.perguntaId === pergunta.id);

    if (!resposta?.alternativaId) {
      return acc + 1;
    }

    return acc;
  }, 0);
}

export function calcularNotaObtida(
  perguntas: Pergunta[],
  respostas: RespostaAluno[]
): number {
  const nota = perguntas.reduce((acc, pergunta) => {
    const resposta = respostas.find((r) => r.perguntaId === pergunta.id);
    const alternativaCorretaId = obterAlternativaCorretaId(pergunta);

    if (resposta?.alternativaId === alternativaCorretaId) {
      return acc + pergunta.valorNota;
    }

    return acc;
  }, 0);

  return arredondarDuasCasas(nota);
}

export function calcularPercentualAcerto(
  notaObtida: number,
  notaTotal: number
): number {
  if (notaTotal <= 0) {
    return 0;
  }

  return arredondarDuasCasas((notaObtida / notaTotal) * 100);
}

export function isAprovado(
  percentualAcerto: number,
  percentualMinimoAprovacao: number = PERCENTUAL_MINIMO_APROVACAO
): boolean {
  return percentualAcerto >= percentualMinimoAprovacao;
}

export function estaDentroDaJanelaDisponibilidade(
  prova: Prova,
  dataReferencia: Date = new Date()
): boolean {
  const inicio = new Date(prova.dataInicioDisponibilidade);
  const fim = new Date(prova.dataFimDisponibilidade);

  return dataReferencia >= inicio && dataReferencia <= fim;
}

export function validarDisponibilidadeProva(
  prova: Prova,
  dataReferencia: Date = new Date()
): ValidacaoDisponibilidadeProva {
  if (prova.status !== "ATIVA") {
    return {
      disponivel: false,
      motivo: "A prova não está ativa",
    };
  }

  const inicio = new Date(prova.dataInicioDisponibilidade);
  const fim = new Date(prova.dataFimDisponibilidade);

  if (dataReferencia < inicio) {
    return {
      disponivel: false,
      motivo: "A prova ainda não está disponível",
    };
  }

  if (dataReferencia > fim) {
    return {
      disponivel: false,
      motivo: "O período da prova já foi encerrado",
    };
  }

  return {
    disponivel: true,
  };
}

export function calcularDataFimPorTempo(
  dataInicio: string,
  tempoDuracaoMinutos: number
): Date {
  const inicio = new Date(dataInicio);
  return new Date(inicio.getTime() + tempoDuracaoMinutos * 60 * 1000);
}

export function tempoExpirado(
  dataInicio: string,
  tempoDuracaoMinutos: number,
  dataReferencia: Date = new Date()
): boolean {
  const limite = calcularDataFimPorTempo(dataInicio, tempoDuracaoMinutos);
  return dataReferencia > limite;
}

export function ordenarPerguntas(perguntas: Pergunta[]): Pergunta[] {
  return [...perguntas].sort((a, b) => a.ordem - b.ordem);
}