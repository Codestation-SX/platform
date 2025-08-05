// app/painel/perfil/components/PasswordChangeForm.tsx
"use client";

import {
  Box,
  FormControl,
  FormLabel,
  TextField,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { api } from "@/lib/api";
import { handleApiClientError } from "@/utils/handleApiClientError";
import { useToast } from "@/components/hooks/useToast";

const schema = z
  .object({
    newPassword: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "As senhas não coincidem",
  });

type PasswordFormData = z.infer<typeof schema>;

export default function PasswordChangeForm() {
  const { success } = useToast();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    setLoading(true);
    setApiError(null);
    try {
      await api.put("/api/user/password", { password: data.newPassword });
      success("Senha atualizada com sucesso!");
      reset();
    } catch (error) {
      setApiError(handleApiClientError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      noValidate
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
    >
      {apiError && (
        <Typography color="error" variant="body2">
          {apiError}
        </Typography>
      )}

      <FormControl>
        <FormLabel>Nova senha</FormLabel>
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="password"
              fullWidth
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              disabled={loading}
            />
          )}
        />
      </FormControl>

      <FormControl>
        <FormLabel>Confirmar nova senha</FormLabel>
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              type="password"
              fullWidth
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={loading}
            />
          )}
        />
      </FormControl>

      <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
        >
          Alterar senha
        </Button>
      </Stack>
    </Box>
  );
}
