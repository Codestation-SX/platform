"use client";
import { Alert } from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export function PaymentAlerts({ type }: { type: "BOLETO" | "PIX" }) {
  if (type === "BOLETO") {
    return (
      <Alert severity="warning" icon={<WarningRoundedIcon />}>
        O pedido será processado após o pagamento do boleto.
      </Alert>
    );
  }

  if (type === "PIX") {
    return (
      <Alert severity="info" icon={<InfoOutlinedIcon />}>
        Um QR Code será gerado para pagamento imediato via Pix.
      </Alert>
    );
  }

  return null;
}
