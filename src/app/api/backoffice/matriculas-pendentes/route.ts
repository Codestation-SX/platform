import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Alunos sem pagamento ou com pagamento não confirmado
  const alunos = await prisma.user.findMany({
    where: {
      role: "student",
      deletedAt: null,
      OR: [
        { payment: null },
        { payment: { status: { not: "PAID" } } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      cpf: true,
      birthDate: true,
      educationLevel: true,
      phone: true,
      createdAt: true,
      address: {
        select: {
          zipCode: true,
          street: true,
          number: true,
          complement: true,
          neighborhood: true,
          city: true,
          state: true,
        },
      },
      payment: {
        select: { status: true, createdAt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(alunos);
}
