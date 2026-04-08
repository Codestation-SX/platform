"use client";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { paymentSchema, PaymentFormValues } from "./paymentSchema";

const PAYMENT_SESSION_KEY = "payment_form_draft";
import { PaymentOptions } from "./PaymentOptions";
import { CreditCardFields } from "./CreditCardFields";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import PaymentSuccessModal from "./PaymentSuccessModal";
import { useRouter } from "next/navigation";

interface PixGeneratedData {
  pixQrCode: string;
  pixKey: string;
  pixExpirationDate?: string | null;
}

interface Props {
  onPixGenerated?: (data: PixGeneratedData) => void;
}

export default function PaymentForm({ onPixGenerated }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [precoCurso, setPrecoCurso] = useState<number>(1200);
  const [pixAutoSubmitting, setPixAutoSubmitting] = useState(false);
  const pixTriggeredRef = useRef(false);

  useEffect(() => {
    fetch("/api/public/configuracoes")
      .then((r) => r.json())
      .then((data) => {
        if (data.preco_curso) setPrecoCurso(data.preco_curso);
      })
      .catch(() => {});
  }, []);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: "CREDIT_CARD",
      cardNumber: "",
      cardName: "",
      holderCpf: "",
      expirationDate: "",
      cvv: "",
      installments: "",
    },
  });

  const watchedValues = useWatch({ control });

  // Restore draft on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(PAYMENT_SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<PaymentFormValues>;
        (Object.entries(parsed) as [keyof PaymentFormValues, string][]).forEach(
          ([key, value]) => setValue(key, value)
        );
      } catch {}
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    sessionStorage.setItem(PAYMENT_SESSION_KEY, JSON.stringify(watchedValues));
  }, [watchedValues]);

  const paymentType = watch("paymentType");

  // Gera QR Code PIX automaticamente ao selecionar PIX
  const generatePix = useCallback(async () => {
    if (!session?.user.id) return;
    setPixAutoSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        userId: session.user.id,
        ...(session.user.asaasCustomerId && {
          customerId: session.user.asaasCustomerId,
        }),
        value: precoCurso,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        billingType: "PIX",
      };
      const res = await fetch("/api/public/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao gerar QR Code PIX");
      sessionStorage.removeItem(PAYMENT_SESSION_KEY);
      onPixGenerated?.({
        pixQrCode: result.data.pixQrCode,
        pixKey: result.data.pixKey,
        pixExpirationDate: result.data.pixExpirationDate ?? null,
      });
    } catch (err: any) {
      setSubmitError(err.message || "Erro ao gerar QR Code PIX. Tente novamente.");
      pixTriggeredRef.current = false;
    } finally {
      setPixAutoSubmitting(false);
    }
  }, [session, precoCurso, onPixGenerated]);

  useEffect(() => {
    if (paymentType !== "PIX") {
      pixTriggeredRef.current = false;
      return;
    }
    if (!session?.user.id) return;
    if (pixTriggeredRef.current) return;
    pixTriggeredRef.current = true;
    generatePix();
  }, [paymentType, session?.user.id, generatePix]);

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
      value: precoCurso,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      billingType: "CREDIT_CARD",
    };

    const [month, year] = formData.expirationDate!.split("/");
    payload.creditCard = {
      holderName: formData.cardName!,
      number: formData.cardNumber!.replace(/\s/g, ""),
      expiryMonth: month,
      expiryYear: "20" + year,
      ccv: formData.cvv!,
    };

    const cpf = formData.holderCpf?.replace(/\D/g, "") || "";
    if (!cpf || cpf.length !== 11) {
      setSubmitError("CPF do titular do cartão inválido.");
      return;
    }

    payload.creditCardHolderInfo = {
      name: formData.cardName!,
      email: session?.user.email || "",
      cpfCnpj: cpf,
      postalCode: (session?.user.address?.zipCode || "").replace(/\D/g, ""),
      addressNumber: session?.user.address?.number || "1",
    };

    setSubmitting(true);
    try {
      const res = await fetch("/api/public/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao gerar pagamento");

      sessionStorage.removeItem(PAYMENT_SESSION_KEY);
      setPaymentData({ billingType: "CREDIT_CARD", ...result.data });
      setModalOpen(true);
    } catch (err: any) {
      setSubmitError(
        err.message || "Erro ao processar pagamento. Tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Tela de loading enquanto gera QR PIX automaticamente
  if (paymentType === "PIX" && (pixAutoSubmitting || pixTriggeredRef.current)) {
    return (
      <Container maxWidth="xs" sx={{ padding: 2 }}>
        <Stack spacing={3}>
          <PaymentOptions control={control} />
          <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={4}>
            <CircularProgress />
            <Typography color="text.secondary">Gerando QR Code PIX...</Typography>
          </Box>
          {submitError && (
            <>
              <Typography color="error" variant="body2" textAlign="center">
                {submitError}
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  pixTriggeredRef.current = false;
                  generatePix();
                }}
              >
                Tentar novamente
              </Button>
            </>
          )}
        </Stack>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="xs" sx={{ padding: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <PaymentOptions control={control} />
            {paymentType === "CREDIT_CARD" && (
              <CreditCardFields
                control={control}
                errors={errors}
                precoCurso={precoCurso}
              />
            )}
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
              startIcon={
                submitting ? (
                  <CircularProgress size={18} color="inherit" />
                ) : null
              }
            >
              {submitting ? "Processando..." : "Confirmar pagamento"}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              disabled={submitting}
              onClick={() => router.back()}
            >
              Voltar
            </Button>
          </Stack>
        </form>
      </Container>
      {paymentData && modalOpen && (
        <PaymentSuccessModal
          open={modalOpen}
          onClose={async () => {
            setModalOpen(false);
            await fetch("/api/auth/session");
            window.location.href = "/painel/aulas";
          }}
          paymentData={paymentData}
        />
      )}
    </>
  );
}
