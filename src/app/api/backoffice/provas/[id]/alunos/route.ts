import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateAdminAccess } from "@/utils/validateAdminAccess";
import { handleApiError } from "@/utils/api/handleApiError";

// GET /api/backoffice/provas/[id]/alunos — lista alunos atribuídos individualmente
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const prova = await prisma.prova.findFirst({
      where: { id, deletedAt: null },
      select: {
        alunosAtribuidos: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            turma: { select: { id: true, nome: true } },
          },
        },
      },
    });

    if (!prova) {
      return NextResponse.json({ error: "Prova não encontrada" }, { status: 404 });
    }

    return NextResponse.json(prova.alunosAtribuidos);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/backoffice/provas/[id]/alunos — atribui aluno à prova
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { alunoId } = await req.json();

    if (!alunoId) {
      return NextResponse.json({ error: "alunoId é obrigatório" }, { status: 400 });
    }

    const prova = await prisma.prova.update({
      where: { id },
      data: {
        alunosAtribuidos: { connect: { id: alunoId } },
      },
      select: {
        alunosAtribuidos: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            turma: { select: { id: true, nome: true } },
          },
        },
      },
    });

    return NextResponse.json(prova.alunosAtribuidos);
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/backoffice/provas/[id]/alunos?alunoId=xxx — remove atribuição individual
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const alunoId = searchParams.get("alunoId");

    if (!alunoId) {
      return NextResponse.json({ error: "alunoId é obrigatório" }, { status: 400 });
    }

    const prova = await prisma.prova.update({
      where: { id },
      data: {
        alunosAtribuidos: { disconnect: { id: alunoId } },
      },
      select: {
        alunosAtribuidos: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            turma: { select: { id: true, nome: true } },
          },
        },
      },
    });

    return NextResponse.json(prova.alunosAtribuidos);
  } catch (error) {
    return handleApiError(error);
  }
}
