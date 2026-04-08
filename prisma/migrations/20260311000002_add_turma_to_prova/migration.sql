-- AlterTable
ALTER TABLE "Prova" ADD COLUMN "turmaId" TEXT;

-- AddForeignKey
ALTER TABLE "Prova" ADD CONSTRAINT "Prova_turmaId_fkey" FOREIGN KEY ("turmaId") REFERENCES "Turma"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Prova_turmaId_idx" ON "Prova"("turmaId");
