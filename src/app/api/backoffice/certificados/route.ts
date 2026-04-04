import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateAdminAccess } from "@/utils/validateAdminAccess";
import { handleApiError } from "@/utils/api/handleApiError";
import { z } from "zod";

// GET — listar certificados (filtros: turmaId, alunoId)
export async function GET(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const turmaId = searchParams.get("turmaId") || "";
    const alunoId = searchParams.get("alunoId") || "";

    const where: any = {};
    if (turmaId) where.turmaId = turmaId;
    if (alunoId) where.alunoId = alunoId;

    const certificados = await prisma.certificado.findMany({
      where,
      include: {
        aluno: { select: { id: true, firstName: true, lastName: true, email: true } },
        turma: { select: { id: true, nome: true } },
      },
      orderBy: { emitidoEm: "desc" },
    });

    return NextResponse.json(certificados);
  } catch (error) {
    console.error("[GET /api/backoffice/certificados]", error);
    return handleApiError(error);
  }
}

const emitirSchema = z.object({
  turmaId: z.string().min(1),
  alunoIds: z.array(z.string().min(1)).min(1, "Selecione ao menos um aluno"),
});

// POST — emitir certificado(s) para aluno(s)
export async function POST(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { turmaId, alunoIds } = emitirSchema.parse(body);

    // Upsert para cada aluno — se já existir, atualiza o emitidoEm
    const resultados = await Promise.allSettled(
      alunoIds.map((alunoId) =>
        prisma.certificado.upsert({
          where: { alunoId_turmaId: { alunoId, turmaId } },
          create: { alunoId, turmaId },
          update: { emitidoEm: new Date() },
          include: {
            aluno: { select: { id: true, firstName: true, lastName: true, email: true } },
            turma: { select: { id: true, nome: true } },
          },
        })
      )
    );

    const emitidos = resultados
      .filter((r) => r.status === "fulfilled")
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    return NextResponse.json(
      { message: `${emitidos.length} certificado(s) emitido(s)`, certificados: emitidos },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/backoffice/certificados]", error);
    return handleApiError(error);
  }
}
