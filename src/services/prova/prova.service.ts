import  prisma  from "@/lib/prisma";

type AlternativaInput = {
  texto: string;
  correta: boolean;
};

type PerguntaInput = {
  enunciado: string;
  valorNota: number;
  ordem: number;
  alternativas: AlternativaInput[];
};

type CriarProvaInput = {
  titulo: string;
  descricao?: string;
  turmaId?: string;
  dataInicioDisponibilidade: string;
  dataFimDisponibilidade: string;
  tempoDuracaoMinutos: number;
  percentualMinimoAprovacao?: number;
  status?: "RASCUNHO" | "ATIVA" | "INATIVA" | "ENCERRADA";
  perguntas: PerguntaInput[];
};

type RespostaFinalizacaoInput = {
  perguntaId: string;
  alternativaId?: string | null;
};

export class ProvaService {
  static async listarBackoffice() {
    return prisma.prova.findMany({
      where: { deletedAt: null },
      include: {
        perguntas: {
          include: {
            alternativas: true,
          },
          orderBy: { ordem: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async obterPorId(id: string) {
    return prisma.prova.findFirst({
      where: { id, deletedAt: null },
      include: {
        perguntas: {
          include: {
            alternativas: true,
          },
          orderBy: { ordem: "asc" },
        },
      },
    });
  }

  static validarPayload(payload: CriarProvaInput) {
    if (!payload.titulo?.trim()) {
      throw new Error("O título da prova é obrigatório");
    }

    if (!payload.dataInicioDisponibilidade) {
      throw new Error("A data de início é obrigatória");
    }

    if (!payload.dataFimDisponibilidade) {
      throw new Error("A data de fim é obrigatória");
    }

    if (!payload.tempoDuracaoMinutos || payload.tempoDuracaoMinutos <= 0) {
      throw new Error("O tempo de duração deve ser maior que zero");
    }

    if (!payload.perguntas?.length) {
      throw new Error("A prova deve ter ao menos 1 pergunta");
    }

    const dataInicio = new Date(payload.dataInicioDisponibilidade);
    const dataFim = new Date(payload.dataFimDisponibilidade);

    if (Number.isNaN(dataInicio.getTime())) {
      throw new Error("Data de início inválida");
    }

    if (Number.isNaN(dataFim.getTime())) {
      throw new Error("Data de fim inválida");
    }

    if (dataFim <= dataInicio) {
      throw new Error("A data de fim deve ser maior que a data de início");
    }

    for (const pergunta of payload.perguntas) {
      if (!pergunta.enunciado?.trim()) {
        throw new Error("Todas as perguntas devem possuir enunciado");
      }

      if (!pergunta.valorNota || pergunta.valorNota <= 0) {
        throw new Error("Toda pergunta deve possuir valor maior que zero");
      }

      if (!pergunta.alternativas || pergunta.alternativas.length < 2) {
        throw new Error("Toda pergunta deve possuir ao menos 2 alternativas");
      }

      const corretas = pergunta.alternativas.filter((a) => a.correta).length;

      if (corretas !== 1) {
        throw new Error("Toda pergunta deve possuir exatamente 1 alternativa correta");
      }
    }
  }

  static async criar(payload: CriarProvaInput) {
    this.validarPayload(payload);

    return prisma.prova.create({
      data: {
        titulo: payload.titulo,
        descricao: payload.descricao,
        turmaId: payload.turmaId || null,
        dataInicioDisponibilidade: new Date(payload.dataInicioDisponibilidade),
        dataFimDisponibilidade: new Date(payload.dataFimDisponibilidade),
        tempoDuracaoMinutos: payload.tempoDuracaoMinutos,
        percentualMinimoAprovacao: payload.percentualMinimoAprovacao ?? 86,
        status: payload.status ?? "RASCUNHO",
        perguntas: {
          create: payload.perguntas.map((pergunta) => ({
            enunciado: pergunta.enunciado,
            valorNota: pergunta.valorNota,
            ordem: pergunta.ordem,
            alternativas: {
              create: pergunta.alternativas.map((alternativa) => ({
                texto: alternativa.texto,
                correta: alternativa.correta,
              })),
            },
          })),
        },
      },
      include: {
        perguntas: {
          include: {
            alternativas: true,
          },
          orderBy: { ordem: "asc" },
        },
      },
    });
  }

  static async atualizar(id: string, payload: CriarProvaInput) {
    this.validarPayload(payload);

    await prisma.$transaction(async (tx) => {
      // Atualiza apenas os metadados da prova (datas, título, etc.)
      await tx.prova.update({
        where: { id },
        data: {
          titulo: payload.titulo,
          descricao: payload.descricao,
          turmaId: payload.turmaId || null,
          dataInicioDisponibilidade: new Date(payload.dataInicioDisponibilidade),
          dataFimDisponibilidade: new Date(payload.dataFimDisponibilidade),
          tempoDuracaoMinutos: payload.tempoDuracaoMinutos,
          percentualMinimoAprovacao: payload.percentualMinimoAprovacao ?? 86,
          status: payload.status ?? "RASCUNHO",
        },
      });

      // Carrega perguntas existentes
      const existingPerguntas = await tx.provaPergunta.findMany({
        where: { provaId: id },
        include: { alternativas: { orderBy: { createdAt: "asc" } } },
        orderBy: { ordem: "asc" },
      });

      const existingByOrdem = new Map(existingPerguntas.map((p) => [p.ordem, p]));
      const incomingOrdems = new Set(payload.perguntas.map((p) => p.ordem));

      // Remove perguntas que não estão mais no payload
      const toDelete = existingPerguntas.filter((p) => !incomingOrdems.has(p.ordem));
      if (toDelete.length > 0) {
        await tx.provaPergunta.deleteMany({
          where: { id: { in: toDelete.map((p) => p.id) } },
        });
      }

      // Reconcilia cada pergunta do payload preservando IDs existentes
      for (const incoming of payload.perguntas) {
        const existing = existingByOrdem.get(incoming.ordem);

        if (existing) {
          // Atualiza a pergunta existente (preserva o ID — mantém respostas dos alunos válidas)
          await tx.provaPergunta.update({
            where: { id: existing.id },
            data: {
              enunciado: incoming.enunciado,
              valorNota: incoming.valorNota,
              ordem: incoming.ordem,
            },
          });

          // Reconcilia alternativas por posição (preserva IDs — mantém ProvaResposta.alternativaId válido)
          const existingAlts = existing.alternativas;
          const incomingAlts = incoming.alternativas;

          for (let i = 0; i < incomingAlts.length; i++) {
            if (i < existingAlts.length) {
              await tx.provaAlternativa.update({
                where: { id: existingAlts[i].id },
                data: {
                  texto: incomingAlts[i].texto,
                  correta: incomingAlts[i].correta,
                },
              });
            } else {
              await tx.provaAlternativa.create({
                data: {
                  perguntaId: existing.id,
                  texto: incomingAlts[i].texto,
                  correta: incomingAlts[i].correta,
                },
              });
            }
          }

          // Remove alternativas excedentes
          if (existingAlts.length > incomingAlts.length) {
            await tx.provaAlternativa.deleteMany({
              where: {
                id: { in: existingAlts.slice(incomingAlts.length).map((a) => a.id) },
              },
            });
          }
        } else {
          // Cria nova pergunta (não existia antes)
          await tx.provaPergunta.create({
            data: {
              provaId: id,
              enunciado: incoming.enunciado,
              valorNota: incoming.valorNota,
              ordem: incoming.ordem,
              alternativas: {
                create: incoming.alternativas.map((a) => ({
                  texto: a.texto,
                  correta: a.correta,
                })),
              },
            },
          });
        }
      }
    });

    return this.obterPorId(id);
  }

  static async excluir(id: string) {
    return prisma.prova.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "ENCERRADA",
      },
    });
  }

 static async listarDisponiveisParaAluno(alunoId: string) {
  const agora = new Date();

  const aluno = await prisma.user.findUnique({
    where: { id: alunoId },
    select: { turmaId: true, ativo: true },
  });

  if (aluno?.ativo === false) {
    return [];
  }

  const tentativasDoAluno = await prisma.provaTentativa.findMany({
    where: { alunoId },
    select: { provaId: true },
  });

  const provasJaTentadas = tentativasDoAluno.map((t) => t.provaId);

  const whereOr: object[] = [];

  if (aluno?.turmaId) {
    whereOr.push({ turmaId: aluno.turmaId });
  }

  // Provas atribuídas individualmente
  whereOr.push({ alunosAtribuidos: { some: { id: alunoId } } });

  if (whereOr.length === 0) return [];

  return prisma.prova.findMany({
    where: {
      deletedAt: null,
      status: "ATIVA",
      dataFimDisponibilidade: { gte: agora },
      id: { notIn: provasJaTentadas },
      OR: whereOr,
    },
    select: {
      id: true,
      titulo: true,
      descricao: true,
      tempoDuracaoMinutos: true,
      percentualMinimoAprovacao: true,
      status: true,
      dataInicioDisponibilidade: true,
      dataFimDisponibilidade: true,
    },
    orderBy: { dataInicioDisponibilidade: "asc" },
  });
}
  static async iniciarTentativa(provaId: string, alunoId: string) {
    const prova = await prisma.prova.findFirst({
      where: {
        id: provaId,
        deletedAt: null,
      },
      include: {
        perguntas: {
          include: { alternativas: true },
          orderBy: { ordem: "asc" },
        },
        alunosAtribuidos: { select: { id: true } },
      },
    });

    if (!prova) {
      throw new Error("Prova não encontrada");
    }

    const agora = new Date();

    if (prova.status !== "ATIVA") {
      throw new Error("A prova não está ativa");
    }

    if (agora < prova.dataInicioDisponibilidade) {
      throw new Error("A prova ainda não está disponível");
    }

    if (agora > prova.dataFimDisponibilidade) {
      throw new Error("O período da prova já foi encerrado");
    }

    // Verifica se o aluno tem permissão para realizar esta prova
    const aluno = await prisma.user.findUnique({
      where: { id: alunoId },
      select: { turmaId: true },
    });

    const atribuidoIndividualmente = prova.alunosAtribuidos.some(
      (a) => a.id === alunoId
    );
    const pertenceATurma =
      !!prova.turmaId && aluno?.turmaId === prova.turmaId;

    if (!atribuidoIndividualmente && !pertenceATurma) {
      throw new Error("Você não tem permissão para realizar esta prova");
    }

    const tentativaExistente = await prisma.provaTentativa.findUnique({
      where: {
        provaId_alunoId: {
          provaId,
          alunoId,
        },
      },
    });

    if (tentativaExistente) {
      throw new Error("Você já possui uma tentativa para esta prova");
    }

    const tentativa = await prisma.provaTentativa.create({
      data: {
        provaId,
        alunoId,
        status: "EM_ANDAMENTO",
      },
    });

    return {
      tentativa,
      prova,
    };
  }

  static async finalizarTentativa(
    provaId: string,
    alunoId: string,
    respostas: RespostaFinalizacaoInput[],
    fraudeDetectada = false,
    motivoFraude?: string
  ) {
    const tentativa = await prisma.provaTentativa.findUnique({
      where: {
        provaId_alunoId: {
          provaId,
          alunoId,
        },
      },
      include: {
        prova: {
          include: {
            perguntas: {
              include: {
                alternativas: true,
              },
              orderBy: { ordem: "asc" },
            },
          },
        },
      },
    });

    if (!tentativa) {
      throw new Error("Tentativa não encontrada");
    }

    if (tentativa.status !== "EM_ANDAMENTO") {
      throw new Error("A tentativa não está em andamento");
    }

    const agora = new Date();
    const limite = new Date(
      tentativa.dataInicio.getTime() + tentativa.prova.tempoDuracaoMinutos * 60 * 1000
    );

    const expirou = agora > limite;

    await prisma.$transaction(async (tx) => {
      await tx.provaResposta.deleteMany({
        where: {
          tentativaId: tentativa.id,
        },
      });

      if (respostas.length > 0) {
        await tx.provaResposta.createMany({
          data: respostas.map((resposta) => ({
            tentativaId: tentativa.id,
            perguntaId: resposta.perguntaId,
            alternativaId: resposta.alternativaId ?? null,
          })),
        });
      }

      if (fraudeDetectada) {
        await tx.provaTentativa.update({
          where: { id: tentativa.id },
          data: {
            fraudeDetectada: true,
            motivoFraude: motivoFraude ?? "Fraude detectada",
            status: "REPROVADO_POR_FRAUDE",
            dataFim: agora,
            notaTotal: 0,
            notaObtida: 0,
            percentualAcerto: 0,
            aprovado: false,
          },
        });

        await tx.provaEventoFraude.create({
          data: {
            tentativaId: tentativa.id,
            tipo: "FRAUDE",
            descricao: motivoFraude ?? "Fraude detectada",
          },
        });

        return;
      }

      const perguntas = tentativa.prova.perguntas;
      const notaTotal = perguntas.reduce((acc, pergunta) => acc + pergunta.valorNota, 0);

      let notaObtida = 0;

      for (const pergunta of perguntas) {
        const resposta = respostas.find((r) => r.perguntaId === pergunta.id);
        const correta = pergunta.alternativas.find((a) => a.correta);

        if (correta && resposta?.alternativaId === correta.id) {
          notaObtida += pergunta.valorNota;
        }
      }

      const percentualAcerto = notaTotal > 0 ? (notaObtida / notaTotal) * 100 : 0;
      const aprovado = percentualAcerto >= tentativa.prova.percentualMinimoAprovacao;

      await tx.provaTentativa.update({
        where: { id: tentativa.id },
        data: {
          dataFim: agora,
          status: expirou ? "ENCERRADA_POR_TEMPO" : "CONCLUIDA",
          notaTotal,
          notaObtida,
          percentualAcerto,
          aprovado,
        },
      });
    });

    return prisma.provaTentativa.findUnique({
      where: { id: tentativa.id },
      include: {
        respostas: true,
        prova: {
          include: {
            perguntas: {
              include: {
                alternativas: true,
              },
              orderBy: { ordem: "asc" },
            },
          },
        },
      },
    });
  }

  static async obterResultado(provaId: string, alunoId: string) {
    return prisma.provaTentativa.findUnique({
      where: {
        provaId_alunoId: {
          provaId,
          alunoId,
        },
      },
      include: {
        respostas: true,
        prova: {
          include: {
            perguntas: {
              include: {
                alternativas: true,
              },
              orderBy: { ordem: "asc" },
            },
          },
        },
      },
    });
  }
  static async recalcularNotas(provaId: string) {
    const tentativas = await prisma.provaTentativa.findMany({
      where: {
        provaId,
        status: { in: ["CONCLUIDA", "ENCERRADA_POR_TEMPO"] },
      },
      include: {
        respostas: true,
        prova: {
          include: {
            perguntas: { include: { alternativas: true } },
          },
        },
        aluno: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    const resultados = [];

    for (const tentativa of tentativas) {
      if (tentativa.respostas.length === 0) {
        resultados.push({
          alunoId: tentativa.alunoId,
          nome: `${tentativa.aluno.firstName} ${tentativa.aluno.lastName}`,
          status: "sem_respostas",
          mensagem: "Respostas não encontradas — dados perdidos pela edição anterior",
        });
        continue;
      }

      const perguntas = tentativa.prova.perguntas;
      const notaTotal = perguntas.reduce((acc, p) => acc + p.valorNota, 0);
      let notaObtida = 0;

      for (const pergunta of perguntas) {
        const resposta = tentativa.respostas.find((r) => r.perguntaId === pergunta.id);
        const correta = pergunta.alternativas.find((a) => a.correta);
        if (correta && resposta?.alternativaId === correta.id) {
          notaObtida += pergunta.valorNota;
        }
      }

      const percentualAcerto = notaTotal > 0 ? (notaObtida / notaTotal) * 100 : 0;
      const aprovado = percentualAcerto >= tentativa.prova.percentualMinimoAprovacao;

      await prisma.provaTentativa.update({
        where: { id: tentativa.id },
        data: { notaTotal, notaObtida, percentualAcerto, aprovado },
      });

      resultados.push({
        alunoId: tentativa.alunoId,
        nome: `${tentativa.aluno.firstName} ${tentativa.aluno.lastName}`,
        status: "recalculado",
        notaObtida,
        notaTotal,
        percentualAcerto: Math.round(percentualAcerto),
        aprovado,
      });
    }

    return resultados;
  }

  static async verificarEEncerrarProva(provaId: string) {
  const prova = await prisma.prova.findFirst({
    where: { id: provaId, deletedAt: null, status: "ATIVA" },
    include: {
      alunosAtribuidos: { select: { id: true } },
    },
  });

  if (!prova) return;

  const agora = new Date();

  const dataExpirou = agora > prova.dataFimDisponibilidade;

  // Coleta IDs únicos dos destinatários da prova
  const alunoIdsSet = new Set<string>(prova.alunosAtribuidos.map((a) => a.id));

  if (prova.turmaId) {
    const alunosTurma = await prisma.user.findMany({
      where: { role: "student", deletedAt: null, ativo: true, turmaId: prova.turmaId },
      select: { id: true },
    });
    alunosTurma.forEach((a) => alunoIdsSet.add(a.id));
  }

  const totalAlunos = alunoIdsSet.size;

  const totalTentativasEncerradas = await prisma.provaTentativa.count({
    where: {
      provaId,
      status: {
        in: ["CONCLUIDA", "ENCERRADA_POR_TEMPO", "REPROVADO_POR_FRAUDE", "EXPIRADA"],
      },
    },
  });

  const todosFinalizaram =
    totalAlunos > 0 && totalTentativasEncerradas >= totalAlunos;

  if (dataExpirou || todosFinalizaram) {
    await prisma.prova.update({
      where: { id: provaId },
      data: { status: "ENCERRADA" },
    });
  }
}
}