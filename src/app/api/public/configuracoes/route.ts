import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<{ chave: string; valor: string }[]>`
      SELECT chave, valor FROM "Configuracao" WHERE chave IN ('preco_pix', 'preco_cartao')
    `;
    const config: Record<string, number> = { preco_pix: 6000, preco_cartao: 1200 };
    for (const row of rows) {
      config[row.chave] = parseFloat(row.valor);
    }
    return NextResponse.json(config);
  } catch {
    return NextResponse.json({ preco_pix: 6000, preco_cartao: 1200 });
  }
}
