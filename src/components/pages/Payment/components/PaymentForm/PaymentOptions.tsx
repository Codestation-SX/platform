"use client";
import { Controller, Control } from "react-hook-form";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import AccountBalanceRoundedIcon from "@mui/icons-material/AccountBalanceRounded";
import SimCardRoundedIcon from "@mui/icons-material/SimCardRounded";
import { styled } from "@mui/material/styles";
import { PaymentFormValues } from "./paymentSchema";

const Card = styled("div", {
  shouldForwardProp: (prop) => prop !== "selected",
})<{ selected: boolean }>(({ theme, selected }) => ({
  border: "1px solid",
  borderColor: selected ? theme.palette.primary.main : theme.palette.divider,
  borderRadius: theme.shape.borderRadius,
  flex: 1,
  padding: theme.spacing(1),
  cursor: "pointer",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export function PaymentOptions({
  control,
}: {
  control: Control<PaymentFormValues>;
}) {
  return (
    <Controller
      control={control}
      name="paymentType"
      render={({ field }) => (
        <FormControl component="fieldset">
          <FormLabel>Método de pagamento</FormLabel>
          <RadioGroup row {...field} sx={{ display: "flex", gap: 2, mt: 1 }}>
            <Card
              selected={field.value === "CREDIT_CARD"}
              onClick={() => field.onChange("CREDIT_CARD")}
            >
              <CardActionArea>
                <CardContent
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <CreditCardRoundedIcon />
                  <Typography>Crédito</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
            <Card
              selected={field.value === "BOLETO"}
              onClick={() => field.onChange("BOLETO")}
            >
              <CardActionArea>
                <CardContent
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <AccountBalanceRoundedIcon />
                  <Typography>Boleto</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
            <Card
              selected={field.value === "PIX"}
              onClick={() => field.onChange("PIX")}
            >
              <CardActionArea>
                <CardContent
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <SimCardRoundedIcon />
                  <Typography>PIX</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </RadioGroup>
        </FormControl>
      )}
    />
  );
}
