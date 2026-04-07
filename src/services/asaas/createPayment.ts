import { PaymentStatus } from "@/generated/prisma";
import { apiAsaas } from "@/lib/asaas";
import prisma from "@/lib/prisma";

type BillingType = "BOLETO" | "PIX" | "CREDIT_CARD";

interface CreatePaymentInput {
  userId: string;
  customerId: string;
  value: number;
  dueDate: string; // formato ISO
  billingType: BillingType;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
  creditCardHolderInfo?: {
    name: string;
    email: string;
    cpfCnpj: string;
    postalCode: string;
    addressNumber: string;
    phone?: string;
  };
}

export async function createPayment(input: CreatePaymentInput) {
  const {
    userId,
    customerId,
    value,
    dueDate,
    billingType,
    creditCard,
    creditCardHolderInfo,
  } = input;

  // Asaas exige dueDate no formato YYYY-MM-DD
  const dueDateFormatted = dueDate.substring(0, 10);

  // 1. Monta o body do pagamento
  const basePayload: any = {
    customer: customerId,
    billingType,
    value,
    dueDate: dueDateFormatted,
  };

  // Cartão de crédito exige dados adicionais
  if (billingType === "CREDIT_CARD" && creditCard && creditCardHolderInfo) {
    basePayload.creditCard = creditCard;
    basePayload.creditCardHolderInfo = creditCardHolderInfo;
  }

  // 2. Chama a API do Asaas
  console.log("[Asaas] POST /payments payload:", JSON.stringify(basePayload));
  const res = await apiAsaas.post("/payments", basePayload);
  const paymentData = res.data;
  console.log("[Asaas] POST /payments response:", JSON.stringify(paymentData));

  if (!paymentData.id) {
    throw new Error("Erro ao criar cobrança no Asaas");
  }

  // 3. Para PIX, busca QR code e chave copia-e-cola antes de salvar
  let pixQrCode: string | undefined;
  let pixKey: string | undefined;
  let pixExpirationDate: string | undefined;

  if (billingType === "PIX") {
    const pixRes = await apiAsaas.get(`/payments/${paymentData.id}/pixQrCode`);
    pixQrCode = pixRes.data.encodedImage;
    pixKey = pixRes.data.payload;
    pixExpirationDate = pixRes.data.expirationDate;
  }

  // 4. Mapeia o status retornado pelo Asaas para o status interno
  const asaasStatus: string = paymentData.status ?? "";
  const dbStatus: PaymentStatus =
    ["RECEIVED", "CONFIRMED"].includes(asaasStatus)
      ? PaymentStatus.PAID
      : PaymentStatus.PENDING;

  // 5. Salva no Prisma com dados do PIX
  const payment = await prisma.payment.create({
    data: {
      userId,
      asaasInvoiceId: paymentData.id,
      value,
      dueDate: new Date(dueDate),
      status: dbStatus,
      billingType,
      pixQrCode: pixQrCode ?? null,
      pixKey: pixKey ?? null,
      pixExpirationDate: pixExpirationDate ? new Date(pixExpirationDate) : null,
    },
  });
  console.log(payment);

  // 5. Retorna dados úteis
  return {
    asaasId: paymentData.id,
    invoiceUrl: paymentData.invoiceUrl,
    bankSlipUrl: paymentData.bankSlipUrl,
    pixQrCode,
    pixKey,
    pixExpirationDate,
    paymentLink: paymentData.invoiceUrl,
  };
}
