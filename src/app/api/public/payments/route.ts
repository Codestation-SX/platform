import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPayment } from "@/services/asaas/createPayment";
import { handleApiError } from "@/utils/api/handleApiError";
import { findOrCreateCustomer } from "@/services/asaas/findOrCreateCustomer";
import prisma from "@/lib/prisma";

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

    // Se não tiver customerId, busca ou cria no Asaas
    if (!customerId) {
      const user = await prisma.user.findUnique({
        where: { id: input.userId },
        include: { address: true },
      });

      if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
      }

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

    const result = await createPayment({ ...input, customerId });

    return NextResponse.json(
      { message: "Pagamento criado com sucesso", data: result },
      { status: 201 }
    );
  } catch (err) {
    return handleApiError(err);
  }
}
