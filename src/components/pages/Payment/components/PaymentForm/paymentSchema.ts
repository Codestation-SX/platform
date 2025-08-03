import { z } from "zod";

export const paymentSchema = z
  .object({
    paymentType: z.enum(["CREDIT_CARD", "BOLETO", "PIX"]),
    cardNumber: z
      .string()
      .min(19, "Número do cartão deve conter 16 dígitos")
      .optional()
      .or(z.literal("")),
    cvv: z.string().length(3, "CVV inválido").optional().or(z.literal("")),
    cardName: z.string().optional().or(z.literal("")),
    expirationDate: z
      .string()
      .regex(/^\d{2}\/\d{2}$/, "Formato inválido (MM/AA)")
      .optional()
      .or(z.literal("")),
    installments: z.string().optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      data.paymentType !== "CREDIT_CARD" ||
      (data.cardNumber &&
        data.cvv &&
        data.cardName &&
        data.expirationDate &&
        data.installments),
    {
      message: "Todos os dados do cartão devem ser preenchidos.",
      path: ["cardNumber"],
    }
  );

export type PaymentFormValues = z.infer<typeof paymentSchema>;
