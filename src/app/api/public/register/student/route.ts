import { NextResponse } from "next/server";
import { registerSchema } from "@/validations/registerSchema";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/utils/api/handleApiError";
import { findOrCreateCustomer } from "@/services/asaas/findOrCreateCustomer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ✅ Validação do Zod
    const data = registerSchema.parse({
      ...body,
      birthDate: new Date(body.birthDate),
    });

    // ✅ Verifica se email já está cadastrado
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: "E-mail já está em uso" },
        { status: 400 }
      );
    }

    // ✅ Criptografa a senha
    const hashedPassword = await hash(data.password, 10);
    console.log(data);
    // ✅ Cria cliente no Asaas (ou retorna existente)
    // const customer = await findOrCreateCustomer({
    //   firstName: data.firstName,
    //   lastName: data.lastName,
    //   email: data.email,
    //   cpf: data.cpf,
    //   address: {
    //     zipCode: data.address.zipCode,
    //     number: data.address.number,
    //   },
    // });

    // ✅ Cria usuário com relacionamento de endereço + Asaas
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        cpf: data.cpf,
        birthDate: data.birthDate,
        educationLevel: data.educationLevel,
        role: "student",
        address: {
          create: data.address,
        },
      },
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso", data: user },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(handleApiError(err));
  }
}
