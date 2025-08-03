"use client";

import { useEffect, useState } from "react";
import { CircularProgress, Box } from "@mui/material";
import GeneratePaymentCard from "./GeneratePaymentCard";
import PaymentConfirmedCard from "./PaymentConfirmedCard";
import { api } from "@/lib/api";

interface PaymentData {
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  invoiceUrl: string;
  contractUrl: string;
}

export default function PaymentSection() {
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentData | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/api/asaas/payments/status");
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

  if (payment?.status === "PAID") {
    return (
      <PaymentConfirmedCard
        invoiceUrl={payment.invoiceUrl}
        contractUrl={payment.contractUrl}
      />
    );
  }

  return <GeneratePaymentCard />;
}
