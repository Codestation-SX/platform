// /api/painel/lessons/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const isAdmin = token?.role === "admin";
    const userId = token?.id as string | undefined;

    if (!token || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Descobrir a turma do usuário (se não for admin)
    // Preferimos token.classroomId, mas se não existir no token, buscamos no banco
    let classroomId: string | null = (token as any)?.classroomId ?? null;

    if (!isAdmin && !classroomId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { classroomId: true },
      });
      classroomId = user?.classroomId ?? null;
    }

    // Se for aluno e não tiver turma definida, retorna vazio (ou poderia ser 403)
    if (!isAdmin && !classroomId) {
      return NextResponse.json([]);
    }

    // Condições para liberação de aulas pagas para alunos
    let canSeePaidLessons = false;

    if (!isAdmin) {
      const contract = await prisma.contract.findUnique({
        where: { userId },
      });

      const payment = await prisma.payment.findUnique({
        where: { userId },
      });

      canSeePaidLessons =
        !!contract?.isSigned &&
        !!contract?.isValidated &&
        !!payment &&
        payment.status === "PAID";
    }

    // ✅ Consulta das units com filtro de turma para alunos
    const units = await prisma.unit.findMany({
      where: {
        deletedAt: null,

        // ✅ Aqui está a separação de turmas
        ...(isAdmin ? {} : { classroomId }),

        lessons: {
          some: {
            deletedAt: null,
            ...(isAdmin
              ? {}
              : {
                  OR: [
                    { isFree: true },
                    ...(canSeePaidLessons ? [{ isFree: false }] : []),
                  ],
                }),
          },
        },
      },
      orderBy: {
        order: "asc",
      },
      include: {
        lessons: {
          where: {
            deletedAt: null,
            ...(isAdmin
              ? {}
              : {
                  OR: [
                    { isFree: true },
                    ...(canSeePaidLessons ? [{ isFree: false }] : []),
                  ],
                }),
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error("[GET /api/painel/lessons]", error);
    return NextResponse.json(
      { error: "Erro ao buscar aulas" },
      { status: 500 }
    );
  }
}
