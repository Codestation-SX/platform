import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateAdminAccess } from "@/utils/validateAdminAccess";
import { handleApiError } from "@/utils/api/handleApiError";

export async function GET(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const nome = searchParams.get("nome") || "";
    const turmaId = searchParams.get("turmaId") || "";
    const dataInicio = searchParams.get("dataInicio") || "";
    const dataFim = searchParams.get("dataFim") || "";

    const where: any = {
      paymentDeferred: true,
      deletedAt: null,
      role: "student",
    };

    if (nome) {
      where.OR = [
        { firstName: { contains: nome, mode: "insensitive" } },
        { lastName: { contains: nome, mode: "insensitive" } },
        { email: { contains: nome, mode: "insensitive" } },
      ];
    }

    if (turmaId) {
      where.turmaId = turmaId;
    }

    if (dataInicio || dataFim) {
      where.createdAt = {};
      if (dataInicio) where.createdAt.gte = new Date(dataInicio);
      if (dataFim) {
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        where.createdAt.lte = fim;
      }
    }

    const alunos = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        cpf: true,
        createdAt: true,
        ativo: true,
        turma: { select: { id: true, nome: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(alunos);
  } catch (error) {
    console.error("[GET /api/backoffice/matriculas]", error);
    return handleApiError(error);
  }
}
