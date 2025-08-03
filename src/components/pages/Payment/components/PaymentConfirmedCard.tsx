"use client";

import { Box, Typography, Button, Alert, Stack } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

interface Props {
  invoiceUrl: string;
  contractUrl: string;
}

export default function PaymentConfirmedCard({
  invoiceUrl,
  contractUrl,
}: Props) {
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
          <CheckCircleRoundedIcon fontSize="large" color="success" />
          <Typography variant="h5" fontWeight="bold">
            Pagamento confirmado!
          </Typography>
        </Box>

        <Alert severity="success">
          Sua matrícula foi registrada com sucesso. Agora é só assinar o
          contrato para começar!
        </Alert>

        <Button
          variant="outlined"
          startIcon={<ReceiptLongRoundedIcon />}
          href={invoiceUrl}
          target="_blank"
        >
          Ver comprovante
        </Button>

        <Button
          variant="contained"
          startIcon={<PictureAsPdfRoundedIcon />}
          href={contractUrl}
          target="_blank"
        >
          Baixar contrato para assinatura
        </Button>
      </Stack>
    </Box>
  );
}
