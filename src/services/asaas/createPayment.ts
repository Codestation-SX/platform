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
    phone: string;
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

  // 1. Monta o body do pagamento
  const basePayload: any = {
    customer: customerId,
    billingType,
    value,
    dueDate,
  };

  // Cartão de crédito exige dados adicionais
  if (billingType === "CREDIT_CARD" && creditCard && creditCardHolderInfo) {
    basePayload.creditCard = creditCard;
    basePayload.creditCardHolderInfo = creditCardHolderInfo;
  }

  // 2. Chama a API do Asaas
  const res = await apiAsaas.post("/payments", basePayload);
  const paymentData = res.data;

  if (!paymentData.id) {
    throw new Error("Erro ao criar cobrança no Asaas");
  }

  // 3. Salva no Prisma
  const payment = await prisma.payment.create({
    data: {
      userId,
      asaasInvoiceId: paymentData.id,
      value,
      dueDate: new Date(dueDate),
      status: PaymentStatus.PENDING,
    },
  });
  console.log(payment);
  // 4. Retorna dados úteis
  return {
    asaasId: paymentData.id,
    invoiceUrl: paymentData.invoiceUrl,
    bankSlipUrl: paymentData.bankSlipUrl,
    pixQrCode: paymentData.pixQrCode,
    pixExpirationDate: paymentData.expirationDate,
    paymentLink: paymentData.invoiceUrl,
  };
}
