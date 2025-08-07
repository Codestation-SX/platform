import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateAdminAccess } from "@/utils/validateAdminAccess";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || typeof id !== "string" || id.trim() === "") {
    return NextResponse.json(
      { error: "ID inválido ou ausente." },
      { status: 400 }
    );
  }

  const authorized = await validateAdminAccess(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        rg: true,
        cpf: true,
        birthDate: true,
        educationLevel: true,
        paymentDeferred: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        address: {
          select: {
            id: true,
            street: true,
            number: true,
            complement: true,
            neighborhood: true,
            city: true,
            state: true,
            zipCode: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[GET /api/backoffice/users/[id]]", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuário." },
      { status: 500 }
    );
  }
}
