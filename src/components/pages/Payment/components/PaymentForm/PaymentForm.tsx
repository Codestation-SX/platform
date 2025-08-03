"use client";
import { Button, Container, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormValues } from "./paymentSchema";
import { PaymentOptions } from "./PaymentOptions";
import { CreditCardFields } from "./CreditCardFields";
import { PaymentAlerts } from "./PaymentAlerts";
import { useSession } from "next-auth/react";
import { useState } from "react";
import PaymentSuccessModal from "./PaymentSuccessModal";
import BoletoFields from "./BoletoFields";
import PixFields from "./PixFields";
import { api } from "@/lib/api";

export default function PaymentForm() {
  const { data: session } = useSession();
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  console.log(session);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: "CREDIT_CARD",
      cardNumber: "",
      cardName: "",
      expirationDate: "",
      cvv: "",
      installments: "",
    },
  });

  const paymentType = watch("paymentType");

  const onSubmit = async (formData: PaymentFormValues) => {
    const userId = session?.user.id; // ou pegue do contexto/autenticação
    const customerId = session?.user.asaasCustomerId; // ou do banco

    if (!userId || !customerId) {
      console.error("Usuário não autenticado ou cliente Asaas não encontrado.");
      return;
    }

    const payload: any = {
      userId,
      customerId,
      value: 1200,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias
      billingType:
        formData.paymentType === "CREDIT_CARD"
          ? "CREDIT_CARD"
          : formData.paymentType.toUpperCase(), // boleto/pix
    };

    if (formData.paymentType === "CREDIT_CARD") {
      const [month, year] = formData.expirationDate!.split("/");

      payload.creditCard = {
        holderName: formData.cardName!,
        number: formData.cardNumber!.replace(/\s/g, ""),
        expiryMonth: month,
        expiryYear: "20" + year,
        ccv: formData.cvv!,
      };

      payload.creditCardHolderInfo = {
        name: formData.cardName!,
        email: session?.user.email || "sem@email.com",
        cpfCnpj: session?.user.cpf || "00000000000",
        postalCode: session?.user.address?.zipCode || "00000000",
        addressNumber: session?.user.address?.number || "1",
      };
    }

    try {
      const res = await fetch("/api/public/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Erro ao gerar pagamento");

      console.log("Pagamento criado:", result.data);

      setPaymentData({
        billingType: payload.billingType,
        ...result.data,
      });
      setModalOpen(true);
    } catch (err) {
      console.error("Erro ao criar pagamento:", err);
    }
  };

  return (
    <>
      <Container maxWidth="xs" sx={{ padding: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <PaymentOptions control={control} />
            {paymentType === "CREDIT_CARD" && (
              <CreditCardFields control={control} errors={errors} />
            )}
            {paymentType === "BOLETO" && <BoletoFields />}
            {paymentType === "PIX" && <PixFields />}
          </Stack>
        </form>
      </Container>
      {paymentData && modalOpen && (
        <PaymentSuccessModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          paymentData={paymentData}
        />
      )}
    </>
  );
}
