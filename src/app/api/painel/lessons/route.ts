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
    const userId = token?.id;

    if (!token || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    // Consulta das units com as aulas conforme regras de visibilidade
    const units = await prisma.unit.findMany({
      where: {
        deletedAt: null,
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
