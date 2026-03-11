import { z } from "zod";
import { PERCENTUAL_MINIMO_APROVACAO } from "@/types/prova";

const alternativaSchema = z.object({
  id: z.string().min(1, "ID da alternativa é obrigatório"),
  texto: z
    .string()
    .trim()
    .min(1, "O texto da alternativa é obrigatório")
    .max(500, "O texto da alternativa deve ter no máximo 500 caracteres"),
  correta: z.boolean(),
});

export const perguntaSchema = z
  .object({
    id: z.string().min(1, "ID da pergunta é obrigatório"),
    enunciado: z
      .string()
      .trim()
      .min(1, "O enunciado da pergunta é obrigatório")
      .max(2000, "O enunciado da pergunta deve ter no máximo 2000 caracteres"),
    valorNota: z
      .number({
        invalid_type_error: "O valor da pergunta deve ser numérico",
      })
      .positive("O valor da pergunta deve ser maior que zero"),
    ordem: z.number().int("A ordem deve ser um número inteiro").min(1),
    alternativas: z
      .array(alternativaSchema)
      .min(2, "A pergunta deve ter ao menos 2 alternativas"),
  })
  .superRefine((pergunta, ctx) => {
    const totalCorretas = pergunta.alternativas.filter((alt) => alt.correta).length;

    if (totalCorretas !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["alternativas"],
        message: "A pergunta deve possuir exatamente 1 alternativa correta",
      });
    }
  });

export const provaSchema = z
  .object({
    id: z.string().min(1, "ID da prova é obrigatório"),
    titulo: z
      .string()
      .trim()
      .min(1, "O título da prova é obrigatório")
      .max(255, "O título deve ter no máximo 255 caracteres"),
    descricao: z
      .string()
      .trim()
      .max(2000, "A descrição deve ter no máximo 2000 caracteres")
      .optional()
      .or(z.literal("")),
    turmaId: z.string().trim().min(1, "A turma é obrigatória"),
    dataInicioDisponibilidade: z.string().min(1, "A data de início é obrigatória"),
    dataFimDisponibilidade: z.string().min(1, "A data de fim é obrigatória"),
    tempoDuracaoMinutos: z
      .number({
        invalid_type_error: "O tempo de duração deve ser numérico",
      })
      .int("O tempo de duração deve ser um número inteiro")
      .positive("O tempo de duração deve ser maior que zero"),
    status: z.enum(["RASCUNHO", "ATIVA", "INATIVA", "ENCERRADA"]),
    percentualMinimoAprovacao: z
      .number({
        invalid_type_error: "O percentual mínimo deve ser numérico",
      })
      .min(0, "O percentual mínimo não pode ser menor que 0")
      .max(100, "O percentual mínimo não pode ser maior que 100")
      .default(PERCENTUAL_MINIMO_APROVACAO),
    perguntas: z
      .array(perguntaSchema)
      .min(1, "A prova deve possuir ao menos 1 pergunta"),
  })
  .superRefine((prova, ctx) => {
    const dataInicio = new Date(prova.dataInicioDisponibilidade);
    const dataFim = new Date(prova.dataFimDisponibilidade);

    if (Number.isNaN(dataInicio.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dataInicioDisponibilidade"],
        message: "Data de início inválida",
      });
    }

    if (Number.isNaN(dataFim.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dataFimDisponibilidade"],
        message: "Data de fim inválida",
      });
    }

    if (
      !Number.isNaN(dataInicio.getTime()) &&
      !Number.isNaN(dataFim.getTime()) &&
      dataFim <= dataInicio
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dataFimDisponibilidade"],
        message: "A data de fim deve ser maior que a data de início",
      });
    }

    const ordens = prova.perguntas.map((p) => p.ordem);
    const ordensDuplicadas = ordens.filter(
      (ordem, index) => ordens.indexOf(ordem) !== index
    );

    if (ordensDuplicadas.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["perguntas"],
        message: "Existem perguntas com ordem duplicada",
      });
    }
  });

export const respostaAlunoSchema = z.object({
  perguntaId: z.string().min(1, "Pergunta é obrigatória"),
  alternativaId: z.string().nullable().optional(),
});

export const tentativaProvaSchema = z.object({
  id: z.string().min(1, "ID da tentativa é obrigatório"),
  provaId: z.string().min(1, "ID da prova é obrigatório"),
  alunoId: z.string().min(1, "ID do aluno é obrigatório"),
  dataInicio: z.string().min(1, "Data de início é obrigatória"),
  dataFim: z.string().nullable().optional(),
  status: z.enum([
    "NAO_INICIADA",
    "EM_ANDAMENTO",
    "CONCLUIDA",
    "ENCERRADA_POR_TEMPO",
    "REPROVADO_POR_FRAUDE",
    "EXPIRADA",
  ]),
  respostas: z.array(respostaAlunoSchema),
  fraudeDetectada: z.boolean(),
  motivoFraude: z.string().nullable().optional(),
});

export type ProvaSchemaInput = z.infer<typeof provaSchema>;
export type PerguntaSchemaInput = z.infer<typeof perguntaSchema>;
export type AlternativaSchemaInput = z.infer<typeof alternativaSchema>;
export type RespostaAlunoSchemaInput = z.infer<typeof respostaAlunoSchema>;
export type TentativaProvaSchemaInput = z.infer<typeof tentativaProvaSchema>;