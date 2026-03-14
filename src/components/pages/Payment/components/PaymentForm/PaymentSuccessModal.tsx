"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import Image from "next/image";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  paymentData: {
    billingType: "PIX" | "BOLETO" | "CREDIT_CARD";
    invoiceUrl?: string;
    bankSlipUrl?: string;
    pixQrCode?: string;
    pixKey?: string;
    pixExpirationDate?: string;
  };
}

export default function PaymentSuccessModal({
  open,
  onClose,
  paymentData,
}: Props) {
  const { billingType, invoiceUrl, bankSlipUrl, pixQrCode, pixKey, pixExpirationDate } =
    paymentData;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Pagamento gerado com sucesso</DialogTitle>
      <DialogContent>
        {billingType === "PIX" ? (
          <>
            {pixQrCode && (
              <>
                <Typography variant="body1" gutterBottom>
                  Escaneie o QR Code para pagar com Pix:
                </Typography>
                <Box textAlign="center" my={2}>
                  <Image
                    src={`data:image/png;base64,${pixQrCode}`}
                    alt="QR Code Pix"
                    width={200}
                    height={200}
                    style={{ maxWidth: "100%", height: "auto" }}
                  />
                </Box>
              </>
            )}
            {pixKey && (
              <>
                <Typography variant="body2" color="text.secondary" mt={1} mb={1}>
                  Ou copie a chave Pix (copia e cola):
                </Typography>
                <TextField
                  fullWidth
                  value={pixKey}
                  size="small"
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={copied ? "Copiado!" : "Copiar"}>
                          <IconButton onClick={handleCopy} edge="end" size="small">
                            {copied ? (
                              <CheckIcon fontSize="small" color="success" />
                            ) : (
                              <ContentCopyIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
            {pixExpirationDate && (
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Expira em: {new Date(pixExpirationDate).toLocaleString("pt-BR")}
              </Typography>
            )}
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
