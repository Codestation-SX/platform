"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import CreditScoreRoundedIcon from "@mui/icons-material/CreditScoreRounded";
import { api } from "@/lib/api";
import { useSession } from "next-auth/react";

export default function GeneratePaymentCard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateInvoice = async () => {
    try {
      setLoading(true);
      setError("");
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3); // adiciona 3 dias
      const res = await api.get("/api/asaas/status");
      console.log(res);
      const url = res?.data?.data?.invoiceUrl;

      if (!url) {
        setError(
          "Não foi possível gerar o link de pagamento. Tente novamente."
        );
        return;
      }

      window.open(url, "_blank");
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar cobrança. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      p={4}
      borderRadius={2}
      boxShadow={3}
      bgcolor="background.paper"
      maxWidth={480}
      mx="auto"
    >
      <Stack spacing={3}>
        <Box display="flex" alignItems="center" gap={1}>
          <CreditScoreRoundedIcon fontSize="large" color="primary" />
          <Typography variant="h5" fontWeight="bold">
            Falta pouco para começar!
          </Typography>
        </Box>

        <Typography variant="body1">
          Para garantir seu acesso completo ao curso, finalize sua matrícula
          realizando o pagamento da taxa única.
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Ao continuar, você será redirecionado para um ambiente seguro da
          Asaas. Lá, poderá escolher entre <strong>Pix</strong>,{" "}
          <strong>Boleto</strong> ou <strong>Cartão de Crédito</strong> para
          efetuar o pagamento.
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Button
          onClick={handleGenerateInvoice}
          variant="contained"
          size="large"
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Ir para pagamento"
          )}
        </Button>
      </Stack>
    </Box>
  );
}
