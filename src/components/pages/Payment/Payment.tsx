"use client";

import { useEffect, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import GeneratePaymentCard from "./components/GeneratePaymentCard";
import PaymentConfirmedCard from "./components/PaymentConfirmedCard";
import { api } from "@/lib/api";
import PaymentForm from "./components/PaymentForm";
interface PaymentData {
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  invoiceUrl: string;
  contractUrl: string;
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentData | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/api/asaas/status");
        setPayment(res.data.data);
      } catch (err) {
        console.error("Erro ao buscar status do pagamento", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (payment?.status === "PENDING") {
    return <PaymentForm />;
  }

  if (payment?.status === "PAID") {
    return (
      <PaymentConfirmedCard
        invoiceUrl={payment.invoiceUrl}
        contractUrl={payment.contractUrl}
      />
    );
  }

  return <PaymentForm />;
}
