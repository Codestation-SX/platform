import { Alert, FormLabel } from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";

export default function BoletoFields() {
  return (
    <>
      <FormLabel>Boleto bancário</FormLabel>
      <Alert severity="warning" icon={<WarningRoundedIcon />}>
        O pagamento será confirmado em até 3 dias úteis após o pagamento do
        boleto.
      </Alert>
    </>
  );
}
