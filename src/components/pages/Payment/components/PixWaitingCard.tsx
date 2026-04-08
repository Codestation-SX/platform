"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
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
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RefreshIcon from "@mui/icons-material/Refresh";
import Image from "next/image";
import { api } from "@/lib/api";

interface Props {
  pixQrCode: string;
  pixKey: string;
  pixExpirationDate?: string | null;
  onPaid: () => void;
  onRegenerate: () => void;
}

const POLL_INTERVAL_MS = 5000;

function useCountdown(expirationDate?: string | null) {
  const getSecondsLeft = useCallback(() => {
    if (!expirationDate) return null;
    return Math.max(
      Math.floor((new Date(expirationDate).getTime() - Date.now()) / 1000),
      0
    );
  }, [expirationDate]);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(() =>
    getSecondsLeft()
  );

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft(getSecondsLeft()), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, getSecondsLeft]);

  return secondsLeft;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function PixWaitingCard({
  pixQrCode,
  pixKey,
  pixExpirationDate,
  onPaid,
  onRegenerate,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const secondsLeft = useCountdown(pixExpirationDate);
  const expired = secondsLeft !== null && secondsLeft <= 0;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Polling: verifica pagamento a cada 5s (para quando expirado ou pago)
  useEffect(() => {
    if (expired) return;
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/api/asaas/status");
        const data = res.data?.data;
        if (data?.status === "PAID") {
          setPaid(true);
          clearInterval(interval);
          setTimeout(() => onPaid(), 1500);
        }
      } catch {
        // silencioso — continua tentando
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [onPaid, expired]);

  // Tela de pagamento confirmado
  if (paid) {
    return (
      <Card>
        <CardContent>
          <Stack alignItems="center" spacing={2} py={4}>
            <CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />
            <Typography variant="h5" fontWeight={700} color="success.main">
              PIX recebido!
            </Typography>
            <Typography color="text.secondary">
              Redirecionando para o painel...
            </Typography>
            <CircularProgress size={24} color="success" />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  // Tela de QR Code expirado
  if (expired) {
    return (
      <Card>
        <CardContent>
          <Stack alignItems="center" spacing={3} py={5}>
            <AccessTimeIcon sx={{ fontSize: 64, color: "warning.main" }} />
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={700} gutterBottom>
                QR Code expirado
              </Typography>
              <Typography color="text.secondary">
                O tempo para pagamento expirou. Gere um novo QR Code para
                continuar.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={onRegenerate}
              size="large"
            >
              Gerar novo QR Code
            </Button>
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
              Escaneie o QR Code abaixo ou copie a chave Pix para realizar o
              pagamento. A confirmação é automática.
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

          {/* Countdown */}
          {secondsLeft !== null && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: "center",
                px: 2,
                py: 1.5,
                borderRadius: 2,
                bgcolor: secondsLeft < 120 ? "warning.main" : "action.hover",
                color:
                  secondsLeft < 120
                    ? "warning.contrastText"
                    : "text.secondary",
                transition: "background-color 0.5s",
              }}
            >
              <AccessTimeIcon fontSize="small" />
              <Typography variant="body2" fontWeight={600}>
                QR Code expira em: {formatTime(secondsLeft)}
              </Typography>
            </Box>
          )}

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
        </Stack>
      </CardContent>
    </Card>
  );
}
