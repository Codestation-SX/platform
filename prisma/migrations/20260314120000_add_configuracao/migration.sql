-- CreateTable
CREATE TABLE "Configuracao" (
    "id" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Configuracao_chave_key" ON "Configuracao"("chave");

-- Seed default course price
INSERT INTO "Configuracao" ("id", "chave", "valor", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'preco_curso', '1200', NOW(), NOW());
