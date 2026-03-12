import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

// Retorna alunos sem turma (padrão) ou todos os alunos (?todos=true)
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const todos = url.searchParams.get("todos") === "true";

  const alunos = await prisma.user.findMany({
    where: {
      role: "student",
      deletedAt: null,
      ...(todos ? {} : { turmaId: null }),
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      turmaId: true,
      turma: { select: { id: true, nome: true } },
      createdAt: true,
    },
    orderBy: { firstName: "asc" },
  });

  return NextResponse.json(alunos);
}
