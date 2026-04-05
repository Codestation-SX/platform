"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Image from "next/image";
import { api } from "@/lib/api";

interface Props {
  pixQrCode: string;
  pixKey: string;
  pixExpirationDate?: string | null;
  onPaid: (invoiceUrl: string, contractUrl: string) => void;
}

const POLL_INTERVAL_MS = 5000;

export default function PixWaitingCard({
  pixQrCode,
  pixKey,
  pixExpirationDate,
  onPaid,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Polling: verifica pagamento a cada 5s
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/api/asaas/status");
        const data = res.data?.data;
        if (data?.status === "PAID") {
          setPaid(true);
          clearInterval(interval);
          setTimeout(() => onPaid(data.invoiceUrl, data.contractUrl), 1500);
        }
      } catch {
        // silencioso — continua tentando
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [onPaid]);

  if (paid) {
    return (
      <Card>
        <CardContent>
          <Stack alignItems="center" spacing={2} py={4}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />
            <Typography variant="h5" fontWeight={700} color="success.main">
              Pagamento confirmado!
            </Typography>
            <Typography color="text.secondary">
              Redirecionando para o painel...
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Pague com Pix
            </Typography>
            <Typography color="text.secondary" mt={0.5}>
              Escaneie o QR Code abaixo ou copie a chave Pix para realizar o pagamento.
              A confirmação é automática.
            </Typography>
          </Box>

          <Alert
            severity="info"
            icon={<CircularProgress size={16} />}
            sx={{ alignItems: "center" }}
          >
            Aguardando confirmação do pagamento...
          </Alert>

          {/* QR Code */}
          <Box display="flex" justifyContent="center">
            <Box
              sx={{
                border: "2px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                display: "inline-block",
              }}
            >
              <Image
                src={`data:image/png;base64,${pixQrCode}`}
                alt="QR Code Pix"
                width={220}
                height={220}
                style={{ display: "block" }}
              />
            </Box>
          </Box>

          <Divider>
            <Chip label="ou copie a chave" size="small" />
          </Divider>

          {/* Chave copia-e-cola */}
          <TextField
            fullWidth
            label="Chave Pix (copia e cola)"
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

          {pixExpirationDate && (
            <Typography variant="caption" color="text.secondary">
              Este QR Code expira em:{" "}
              <strong>
                {new Date(pixExpirationDate).toLocaleString("pt-BR")}
              </strong>
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
