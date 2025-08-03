"use client";

import {
  FormControl,
  FormHelperText,
  FormLabel,
  OutlinedInput,
  Stack,
  TextField,
  Box,
} from "@mui/material";
import { Controller, Control, useWatch } from "react-hook-form";
import { PaymentFormValues } from "./paymentSchema";
import { getCardBrand } from "@/lib/getCardBrand";
import { formatCardNumber } from "@/lib/formatCardNumber";

export function CreditCardFields({
  control,
  errors,
}: {
  control: Control<PaymentFormValues>;
  errors: any;
}) {
  const cardNumber = useWatch({ control, name: "cardNumber" }) || "";
  const brand = getCardBrand(cardNumber);

  return (
    <Stack spacing={2}>
      {/* Número do cartão */}
      <FormControl error={!!errors.cardNumber}>
        <FormLabel>
          Número do cartão {brand && <strong>({brand})</strong>}
        </FormLabel>
        <Controller
          name="cardNumber"
          control={control}
          render={({ field }) => (
            <OutlinedInput
              {...field}
              placeholder="0000 0000 0000 0000"
              size="small"
              onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
            />
          )}
        />
        <FormHelperText>{errors.cardNumber?.message}</FormHelperText>
      </FormControl>

      {/* Nome no cartão */}
      <FormControl error={!!errors.cardName}>
        <FormLabel>Nome no cartão</FormLabel>
        <Controller
          name="cardName"
          control={control}
          render={({ field }) => (
            <OutlinedInput
              {...field}
              placeholder="João da Silva"
              size="small"
            />
          )}
        />
        <FormHelperText>{errors.cardName?.message}</FormHelperText>
      </FormControl>

      <Box display="flex" gap={2}>
        {/* Validade */}
        <FormControl error={!!errors.expirationDate}>
          <FormLabel>Validade (MM/AA)</FormLabel>
          <Controller
            name="expirationDate"
            control={control}
            render={({ field }) => (
              <OutlinedInput
                {...field}
                placeholder="07/29"
                size="small"
                sx={{
                  width: "100px",
                }}
                inputProps={{ maxLength: 5 }}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
                  const masked =
                    raw.length >= 3
                      ? `${raw.slice(0, 2)}/${raw.slice(2)}`
                      : raw;
                  field.onChange(masked);
                }}
              />
            )}
          />
          <FormHelperText>{errors.expirationDate?.message}</FormHelperText>
        </FormControl>
        {/* CVV */}
        <FormControl error={!!errors.cvv}>
          <FormLabel>CVV</FormLabel>
          <Controller
            name="cvv"
            control={control}
            render={({ field }) => (
              <OutlinedInput
                {...field}
                placeholder="123"
                size="small"
                sx={{
                  width: "100px",
                }}
                inputProps={{ maxLength: 3 }}
                onChange={(e) =>
                  field.onChange(e.target.value.replace(/\D/g, "").slice(0, 3))
                }
              />
            )}
          />
          <FormHelperText>{errors.cvv?.message}</FormHelperText>
        </FormControl>
      </Box>
      {/* Parcelas */}
      <FormControl error={!!errors.installments}>
        <FormLabel>Parcelas sem juros</FormLabel>
        <Controller
          name="installments"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              SelectProps={{ native: true }}
              size="small"
            >
              <option value="">Selecione</option>
              {[...Array(12)].map((_, i) => {
                const count = i + 1;
                return (
                  <option key={count} value={`${count}`}>
                    {count}x de R$ {(1200 / count).toFixed(2)} sem juros
                  </option>
                );
              })}
            </TextField>
          )}
        />
        <FormHelperText>{errors.installments?.message}</FormHelperText>
      </FormControl>
    </Stack>
  );
}
