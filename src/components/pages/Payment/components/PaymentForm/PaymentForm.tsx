"use client";
import { Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormValues } from "./paymentSchema";
import { PaymentOptions } from "./PaymentOptions";
import { CreditCardFields } from "./CreditCardFields";
import { PaymentAlerts } from "./PaymentAlerts";
import { useSession } from "next-auth/react";
import { useState } from "react";
import PaymentSuccessModal from "./PaymentSuccessModal";
import PixFields from "./PixFields";
import { api } from "@/lib/api";

export default function PaymentForm() {
  const { data: session } = useSession();
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    const userId = session?.user.id;
    const customerId = session?.user.asaasCustomerId;

    setSubmitError(null);

    if (!userId) {
      setSubmitError("Usuário não autenticado.");
      return;
    }

    const payload: any = {
      userId,
      ...(customerId && { customerId }),
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

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Erro ao gerar pagamento");

      setPaymentData({
        billingType: payload.billingType,
        ...result.data,
      });
      setModalOpen(true);
    } catch (err: any) {
      setSubmitError(err.message || "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setSubmitting(false);
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
            {paymentType === "PIX" && <PixFields />}
            {submitError && (
              <Typography color="error" variant="body2">
                {submitError}
              </Typography>
            )}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            >
              {submitting ? "Processando..." : "Confirmar pagamento"}
            </Button>
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
