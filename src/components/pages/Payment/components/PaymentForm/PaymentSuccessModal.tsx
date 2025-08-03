"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
  Divider,
} from "@mui/material";
import Image from "next/image";

interface Props {
  open: boolean;
  onClose: () => void;
  paymentData: {
    billingType: "PIX" | "BOLETO" | "CREDIT_CARD";
    invoiceUrl?: string;
    bankSlipUrl?: string;
    pixQrCode?: string;
    pixExpirationDate?: string;
  };
}

export default function PaymentSuccessModal({
  open,
  onClose,
  paymentData,
}: Props) {
  const { billingType, invoiceUrl, bankSlipUrl, pixQrCode, pixExpirationDate } =
    paymentData;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Pagamento gerado com sucesso</DialogTitle>
      <DialogContent>
        {billingType === "PIX" && pixQrCode ? (
          <>
            <Typography variant="body1" gutterBottom>
              Escaneie o QR Code para pagar com Pix:
            </Typography>
            <Box textAlign="center" my={2}>
              <Image
                src={`data:image/png;base64,${pixQrCode}`}
                alt="QR Code Pix"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Expira em: {new Date(pixExpirationDate!).toLocaleString()}
            </Typography>
          </>
        ) : billingType === "BOLETO" && bankSlipUrl ? (
          <>
            <Typography>Clique no botão abaixo para abrir o boleto.</Typography>
            <Box mt={2} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open(bankSlipUrl, "_blank")}
              >
                Abrir Boleto
              </Button>
            </Box>
          </>
        ) : invoiceUrl ? (
          <>
            <Typography>
              Clique no botão abaixo para visualizar sua fatura.
            </Typography>
            <Box mt={2} textAlign="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.open(invoiceUrl, "_blank")}
              >
                Ver Fatura
              </Button>
            </Box>
          </>
        ) : (
          <Typography color="error">
            Nenhum link de pagamento disponível.
          </Typography>
        )}

        <Divider sx={{ my: 3 }} />

        <Button fullWidth onClick={onClose}>
          Fechar
        </Button>
      </DialogContent>
    </Dialog>
  );
}
