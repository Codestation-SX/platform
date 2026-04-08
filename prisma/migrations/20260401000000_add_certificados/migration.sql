-- CreateTable
CREATE TABLE "Certificado" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "turmaId" TEXT NOT NULL,
    "emitidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Certificado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Certificado_alunoId_idx" ON "Certificado"("alunoId");

-- CreateIndex
CREATE INDEX "Certificado_turmaId_idx" ON "Certificado"("turmaId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificado_alunoId_turmaId_key" ON "Certificado"("alunoId", "turmaId");

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificado" ADD CONSTRAINT "Certificado_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE CASCADE ON UPDATE CASCADE;
