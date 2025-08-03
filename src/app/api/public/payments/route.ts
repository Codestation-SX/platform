import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createPayment } from "@/services/asaas/createPayment";
import { handleApiError } from "@/utils/api/handleApiError";

const schema = z.object({
  userId: z.string().uuid(),
  customerId: z.string(),
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
      phone: z.string(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const input = schema.parse(body);

    const result = await createPayment(input);

    return NextResponse.json(
      { message: "Pagamento criado com sucesso", data: result },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(handleApiError(err));
  }
}
