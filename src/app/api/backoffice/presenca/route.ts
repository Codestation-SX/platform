import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateAdminAccess } from "@/utils/validateAdminAccess";

export async function GET(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filtro = searchParams.get("filtro") ?? "tres_dias";

  const agora = new Date();
  const quinzeMinutosAtras = new Date(agora.getTime() - 15 * 60 * 1000);
  const tresDiasAtras = new Date(agora.getTime() - 3 * 24 * 60 * 60 * 1000);
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);

  let where: any = { deletedAt: null, role: "student", ativo: true };

  if (filtro === "online") {
    where.lastLoginAt = { gte: quinzeMinutosAtras };
  } else if (filtro === "tres_dias") {
    where.lastLoginAt = { lt: tresDiasAtras };
  } else if (filtro === "semana") {
    where.lastLoginAt = { lt: seteDiasAtras };
  }

  const alunos = await prisma.user.findMany({
    where,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      lastLoginAt: true,
      turma: { select: { id: true, nome: true } },
    },
    orderBy: { lastLoginAt: filtro === "online" ? "desc" : "asc" },
  });

  return NextResponse.json(alunos);
}
