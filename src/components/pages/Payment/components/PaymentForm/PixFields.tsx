import { Alert, FormLabel } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export default function PixFields() {
  return (
    <>
      <FormLabel>Pagamento via Pix</FormLabel>
      <Alert severity="info" icon={<InfoOutlinedIcon />}>
        Um QR Code será gerado para pagamento instantâneo. O acesso será
        liberado após confirmação.
      </Alert>
    </>
  );
}
