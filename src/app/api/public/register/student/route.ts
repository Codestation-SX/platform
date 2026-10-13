import { NextResponse } from "next/server";
import { registerSchema } from "@/validations/registerSchema";
import { hash } from "bcryptjs";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/utils/api/handleApiError";
import { findOrCreateCustomer } from "@/services/asaas/findOrCreateCustomer";
import { resend, ADMIN_EMAIL, FROM_EMAIL } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // ✅ Validação do Zod (normaliza CPF removendo pontuação)
    const data = registerSchema.parse({
      ...body,
      cpf: body.cpf?.replace(/\D/g, ""),
      birthDate: new Date(body.birthDate),
    });

    // ✅ Verifica se email já está cadastrado
    const emailExists = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });

    if (emailExists) {
      return NextResponse.json(
        { error: "E-mail já está em uso" },
        { status: 400 }
      );
    }

    const cpfExists = await prisma.user.findFirst({ where: { cpf: data.cpf, deletedAt: null } });
    if (cpfExists) {
      return NextResponse.json(
        { error: "CPF já cadastrado. Se você já possui uma conta, acesse pelo login." },
        { status: 400 }
      );
    }

    // ✅ Criptografa a senha
    const hashedPassword = await hash(data.password, 10);
    console.log(data);
    // ✅ Cria cliente no Asaas (ou retorna existente) — falha silenciosa para não bloquear cadastro
    let asaasCustomerId: string | undefined;
    try {
      const customer = await findOrCreateCustomer({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        cpf: data.cpf,
        address: {
          zipCode: data.address.zipCode,
          number: data.address.number,
        },
      });
      asaasCustomerId = customer.id;
    } catch (asaasErr) {
      console.error("Erro ao criar cliente no Asaas (não bloqueante):", asaasErr);
    }

    // ✅ Cria usuário com relacionamento de endereço + Asaas
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        cpf: data.cpf,
        phone: data.phone,
        birthDate: data.birthDate,
        educationLevel: data.educationLevel,
        role: "student",
        ...(asaasCustomerId && { asaasCustomerId }),
        address: {
          create: data.address,
        },
      },
    });

    // Notificação de email — falha silenciosa para não bloquear cadastro
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: "Nova matrícula realizada — Codestation",
        html: `
          <h2>Nova matrícula recebida</h2>
          <p><strong>Nome:</strong> ${user.firstName} ${user.lastName}</p>
          <p><strong>E-mail:</strong> ${user.email}</p>
          <p><strong>CPF:</strong> ${user.cpf}</p>
          <p><strong>Cadastrado em:</strong> ${new Date(user.createdAt).toLocaleString("pt-BR")}</p>
          <hr />
          <p>O aluno foi redirecionado para a tela de pagamento. Acompanhe em <a href="https://www.eadcodestation.com.br/backoffice/matriculas-pendentes">Matrículas Pendentes</a>.</p>
        `,
      });
    } catch (emailErr) {
      console.error("Erro ao enviar email de nova matrícula (não bloqueante):", emailErr);
    }

    return NextResponse.json(
      { message: "Usuário criado com sucesso", data: user },
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return handleApiError(err);
  }
}
