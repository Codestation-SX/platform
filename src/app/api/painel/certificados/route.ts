import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getToken } from "next-auth/jwt";
import { handleApiError } from "@/utils/api/handleApiError";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || !token.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const certificados = await prisma.certificado.findMany({
      where: { alunoId: token.id as string },
      include: {
        turma: { select: { id: true, nome: true } },
      },
      orderBy: { emitidoEm: "desc" },
    });

    return NextResponse.json(certificados);
  } catch (error) {
    console.error("[GET /api/painel/certificados]", error);
    return handleApiError(error);
  }
}
