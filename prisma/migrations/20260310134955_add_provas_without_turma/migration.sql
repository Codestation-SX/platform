-- CreateEnum
CREATE TYPE "ProvaStatus" AS ENUM ('RASCUNHO', 'ATIVA', 'INATIVA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "TentativaStatus" AS ENUM ('EM_ANDAMENTO', 'CONCLUIDA', 'ENCERRADA_POR_TEMPO', 'REPROVADO_POR_FRAUDE', 'EXPIRADA');

-- CreateTable
CREATE TABLE "Prova" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicioDisponibilidade" TIMESTAMP(3) NOT NULL,
    "dataFimDisponibilidade" TIMESTAMP(3) NOT NULL,
    "tempoDuracaoMinutos" INTEGER NOT NULL,
    "percentualMinimoAprovacao" DOUBLE PRECISION NOT NULL DEFAULT 86,
    "status" "ProvaStatus" NOT NULL DEFAULT 'RASCUNHO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Prova_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvaPergunta" (
    "id" TEXT NOT NULL,
    "provaId" TEXT NOT NULL,
    "enunciado" TEXT NOT NULL,
    "valorNota" DOUBLE PRECISION NOT NULL,
    "ordem" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvaPergunta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvaAlternativa" (
    "id" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "correta" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvaAlternativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvaTentativa" (
    "id" TEXT NOT NULL,
    "provaId" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataFim" TIMESTAMP(3),
    "status" "TentativaStatus" NOT NULL DEFAULT 'EM_ANDAMENTO',
    "fraudeDetectada" BOOLEAN NOT NULL DEFAULT false,
    "motivoFraude" TEXT,
    "notaTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notaObtida" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "percentualAcerto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvaTentativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvaResposta" (
    "id" TEXT NOT NULL,
    "tentativaId" TEXT NOT NULL,
    "perguntaId" TEXT NOT NULL,
    "alternativaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvaResposta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvaEventoFraude" (
    "id" TEXT NOT NULL,
    "tentativaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProvaEventoFraude_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Prova_status_idx" ON "Prova"("status");

-- CreateIndex
CREATE INDEX "ProvaPergunta_provaId_idx" ON "ProvaPergunta"("provaId");

-- CreateIndex
CREATE UNIQUE INDEX "ProvaPergunta_provaId_ordem_key" ON "ProvaPergunta"("provaId", "ordem");

-- CreateIndex
CREATE INDEX "ProvaAlternativa_perguntaId_idx" ON "ProvaAlternativa"("perguntaId");

-- CreateIndex
CREATE INDEX "ProvaTentativa_alunoId_idx" ON "ProvaTentativa"("alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProvaTentativa_provaId_alunoId_key" ON "ProvaTentativa"("provaId", "alunoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProvaResposta_tentativaId_perguntaId_key" ON "ProvaResposta"("tentativaId", "perguntaId");

-- CreateIndex
CREATE INDEX "ProvaEventoFraude_tentativaId_idx" ON "ProvaEventoFraude"("tentativaId");

-- AddForeignKey
ALTER TABLE "ProvaPergunta" ADD CONSTRAINT "ProvaPergunta_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "Prova"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaAlternativa" ADD CONSTRAINT "ProvaAlternativa_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "ProvaPergunta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaTentativa" ADD CONSTRAINT "ProvaTentativa_provaId_fkey" FOREIGN KEY ("provaId") REFERENCES "Prova"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaTentativa" ADD CONSTRAINT "ProvaTentativa_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaResposta" ADD CONSTRAINT "ProvaResposta_tentativaId_fkey" FOREIGN KEY ("tentativaId") REFERENCES "ProvaTentativa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaResposta" ADD CONSTRAINT "ProvaResposta_perguntaId_fkey" FOREIGN KEY ("perguntaId") REFERENCES "ProvaPergunta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaResposta" ADD CONSTRAINT "ProvaResposta_alternativaId_fkey" FOREIGN KEY ("alternativaId") REFERENCES "ProvaAlternativa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvaEventoFraude" ADD CONSTRAINT "ProvaEventoFraude_tentativaId_fkey" FOREIGN KEY ("tentativaId") REFERENCES "ProvaTentativa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
