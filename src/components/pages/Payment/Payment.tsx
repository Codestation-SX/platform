"use client";

import { useCallback, useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import PaymentConfirmedCard from "./components/PaymentConfirmedCard";
import PixWaitingCard from "./components/PixWaitingCard";
import { api } from "@/lib/api";
import PaymentForm from "./components/PaymentForm";

interface PaymentData {
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  invoiceUrl: string;
  contractUrl: string;
  billingType?: string | null;
  pixQrCode?: string | null;
  pixKey?: string | null;
  pixExpirationDate?: string | null;
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentData | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/api/asaas/status");
        const data = res.data.data;
        // Se já está PAID mas o middleware ainda não sabe (JWT desatualizado),
        // atualiza o cookie do JWT e redireciona para o painel
        if (data?.status === "PAID") {
          await fetch("/api/auth/session");
          window.location.href = "/painel/aulas";
          return;
        }
        setPayment(data);
      } catch (err) {
        console.error("Erro ao buscar status do pagamento", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handlePaid = useCallback(async () => {
    await fetch("/api/auth/session");
    window.location.href = "/painel/aulas";
  }, []);

  const handleRegenerate = useCallback(() => {
    setPayment(null);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // PIX pendente com QR code salvo → tela de espera com polling automático
  if (
    payment?.status === "PENDING" &&
    payment.billingType === "PIX" &&
    payment.pixQrCode &&
    payment.pixKey
  ) {
    return (
      <PixWaitingCard
        pixQrCode={payment.pixQrCode}
        pixKey={payment.pixKey}
        pixExpirationDate={payment.pixExpirationDate}
        onPaid={handlePaid}
        onRegenerate={handleRegenerate}
      />
    );
  }

  if (payment?.status === "PAID") {
    return (
      <PaymentConfirmedCard
        invoiceUrl={payment.invoiceUrl}
        contractUrl={payment.contractUrl}
      />
    );
  }

  // Sem pagamento gerado ou outro método → formulário
  return <PaymentForm />;
}
