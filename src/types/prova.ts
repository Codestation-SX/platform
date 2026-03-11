export const PERCENTUAL_MINIMO_APROVACAO = 86;

export type StatusProva =
  | "RASCUNHO"
  | "ATIVA"
  | "INATIVA"
  | "ENCERRADA";

export type StatusTentativaProva =
  | "NAO_INICIADA"
  | "EM_ANDAMENTO"
  | "CONCLUIDA"
  | "ENCERRADA_POR_TEMPO"
  | "REPROVADO_POR_FRAUDE"
  | "EXPIRADA";

export interface Alternativa {
  id: string;
  texto: string;
  correta: boolean;
}

export interface Pergunta {
  id: string;
  enunciado: string;
  valorNota: number;
  ordem: number;
  alternativas: Alternativa[];
}

export interface Prova {
  id: string;
  titulo: string;
  descricao?: string;
  turmaId: string;
  dataInicioDisponibilidade: string; // ISO string
  dataFimDisponibilidade: string; // ISO string
  tempoDuracaoMinutos: number;
  status: StatusProva;
  perguntas: Pergunta[];
  percentualMinimoAprovacao: number; // no seu caso: 86
  createdAt?: string;
  updatedAt?: string;
}

export interface RespostaAluno {
  perguntaId: string;
  alternativaId?: string | null;
}

export interface TentativaProva {
  id: string;
  provaId: string;
  alunoId: string;
  dataInicio: string; // ISO string
  dataFim?: string | null; // ISO string
  status: StatusTentativaProva;
  respostas: RespostaAluno[];
  fraudeDetectada: boolean;
  motivoFraude?: string | null;
}

export interface ResultadoQuestao {
  perguntaId: string;
  enunciado: string;
  valorNota: number;
  alternativaSelecionadaId?: string | null;
  alternativaCorretaId: string;
  acertou: boolean;
  emBranco: boolean;
  notaObtida: number;
}

export interface ResultadoProva {
  provaId: string;
  alunoId: string;
  tentativaId: string;
  status: StatusTentativaProva;
  totalPerguntas: number;
  totalRespondidas: number;
  totalAcertos: number;
  totalErros: number;
  totalEmBranco: number;
  notaTotal: number;
  notaObtida: number;
  percentualAcerto: number;
  aprovado: boolean;
  fraudeDetectada: boolean;
  motivoFraude?: string | null;
  questoes: ResultadoQuestao[];
  dataInicio: string;
  dataFim?: string | null;
}

export interface EventoFraude {
  tipo:
    | "TROCA_DE_ABA"
    | "SAIDA_DE_TELA"
    | "COPIA"
    | "COLA"
    | "RECORTE"
    | "ATALHO_BLOQUEADO";
  descricao: string;
  dataHora: string;
}

export interface ValidacaoDisponibilidadeProva {
  disponivel: boolean;
  motivo?: string;
}

export interface ValidacaoTentativaUnica {
  permitida: boolean;
  motivo?: string;
}