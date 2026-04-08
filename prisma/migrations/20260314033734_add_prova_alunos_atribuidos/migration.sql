-- CreateTable
CREATE TABLE "_ProvaAlunosAtribuidos" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProvaAlunosAtribuidos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProvaAlunosAtribuidos_B_index" ON "_ProvaAlunosAtribuidos"("B");

-- AddForeignKey
ALTER TABLE "_ProvaAlunosAtribuidos" ADD CONSTRAINT "_ProvaAlunosAtribuidos_A_fkey" FOREIGN KEY ("A") REFERENCES "Prova"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProvaAlunosAtribuidos" ADD CONSTRAINT "_ProvaAlunosAtribuidos_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
