import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { validateAdminAccess } from "@/utils/validateAdminAccess";
import { z } from "zod";
import { handleApiError } from "@/utils/api/handleApiError";

const matriculaSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  rg: z.string().optional(),
  phone: z.string().min(1, "Telefone é obrigatório"),
  birthDate: z.coerce.date({ required_error: "Data de nascimento obrigatória" }),
  educationLevel: z.string().min(1, "Escolaridade é obrigatória"),
  address: z.object({
    zipCode: z.string().min(1, "CEP é obrigatório"),
    state: z.string().min(1, "Estado é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
  }),
});

export async function POST(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = matriculaSchema.parse({
      ...body,
      cpf: body.cpf?.replace(/\D/g, ""),
    });

    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (emailExists) {
      return NextResponse.json(
        { error: "E-mail já está em uso" },
        { status: 400 }
      );
    }

    const cpfExists = await prisma.user.findUnique({
      where: { cpf: data.cpf },
    });
    if (cpfExists) {
      return NextResponse.json(
        { error: "CPF já cadastrado" },
        { status: 400 }
      );
    }

    const hashedPassword = await hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        cpf: data.cpf,
        ...(data.rg && { rg: data.rg }),
        phone: data.phone,
        birthDate: data.birthDate,
        educationLevel: data.educationLevel,
        role: "student",
        paymentDeferred: true,
        address: {
          create: data.address,
        },
      },
    });

    return NextResponse.json(
      { message: "Aluno matriculado com sucesso", id: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/backoffice/matricula]", error);
    return handleApiError(error);
  }
}
