import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const rows = await prisma.$queryRaw<{ chave: string; valor: string }[]>`
      SELECT chave, valor FROM "Configuracao"
    `;
    const result: Record<string, string> = {};
    for (const c of rows) {
      result[c.chave] = c.valor;
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Configuracoes GET]", err);
    return NextResponse.json({ error: "Erro ao buscar configurações" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();

    for (const [chave, valor] of Object.entries(body)) {
      await prisma.$executeRaw`
        INSERT INTO "Configuracao" (id, chave, valor, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${chave}, ${String(valor)}, NOW(), NOW())
        ON CONFLICT (chave) DO UPDATE SET valor = ${String(valor)}, "updatedAt" = NOW()
      `;
    }

    return NextResponse.json({ message: "Configurações salvas com sucesso" });
  } catch (err) {
    console.error("[Configuracoes PUT]", err);
    return NextResponse.json({ error: "Erro ao salvar configurações" }, { status: 500 });
  }
}
