import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<{ valor: string }[]>`
      SELECT valor FROM "Configuracao" WHERE chave = 'preco_curso' LIMIT 1
    `;
    const valor = rows[0] ? parseFloat(rows[0].valor) : 1200;
    return NextResponse.json({ preco_curso: valor });
  } catch {
    return NextResponse.json({ preco_curso: 1200 });
  }
}
