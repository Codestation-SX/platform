import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPayment } from "@/services/asaas/createPayment";
import { handleApiError } from "@/utils/api/handleApiError";
import { findOrCreateCustomer } from "@/services/asaas/findOrCreateCustomer";
import prisma from "@/lib/prisma";
import { sendPaymentConfirmationEmail } from "@/lib/mail";

const schema = z.object({
  userId: z.string().min(1),
  customerId: z.string().optional(),
  value: z.number().positive(),
  dueDate: z.string().refine((d) => !isNaN(Date.parse(d)), {
    message: "Data inválida",
  }),
  billingType: z.enum(["PIX", "BOLETO", "CREDIT_CARD"]),
  creditCard: z
    .object({
      holderName: z.string(),
      number: z.string().min(16),
      expiryMonth: z.string().length(2),
      expiryYear: z.string().length(4),
      ccv: z.string().length(3),
    })
    .optional(),
  creditCardHolderInfo: z
    .object({
      name: z.string(),
      email: z.string().email(),
      cpfCnpj: z.string(),
      postalCode: z.string(),
      addressNumber: z.string(),
      phone: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = schema.parse(body);

    let customerId = input.customerId;

    // Busca o usuário (necessário para email e para criar customer Asaas)
    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      include: { address: true },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Se não tiver customerId, busca ou cria no Asaas
    if (!customerId) {
      if (user.asaasCustomerId) {
        customerId = user.asaasCustomerId;
      } else {
        const customer = await findOrCreateCustomer({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          cpf: user.cpf,
          address: {
            zipCode: user.address?.zipCode || "",
            number: user.address?.number || "",
          },
        });
        customerId = customer.id;

        // Salva o customerId no usuário para próximas vezes
        await prisma.user.update({
          where: { id: user.id },
          data: { asaasCustomerId: customerId },
        });
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID não encontrado" }, { status: 400 });
    }

    // Para PIX: reutiliza cobrança pendente existente — evita duplicatas no Asaas
    if (input.billingType === "PIX") {
      const existing = await prisma.payment.findUnique({
        where: { userId: input.userId },
      });
      if (
        existing?.status === "PENDING" &&
        existing?.billingType === "PIX" &&
        existing?.pixQrCode &&
        existing?.pixKey
      ) {
        return NextResponse.json(
          {
            message: "PIX pendente reutilizado",
            data: {
              pixQrCode: existing.pixQrCode,
              pixKey: existing.pixKey,
              pixExpirationDate: existing.pixExpirationDate?.toISOString() ?? null,
              invoiceUrl: null,
            },
          },
          { status: 200 }
        );
      }
    }

    const result = await createPayment({ ...input, customerId });

    // Envia email de confirmação de pagamento
    await sendPaymentConfirmationEmail({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return NextResponse.json(
      { message: "Pagamento criado com sucesso", data: result },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
