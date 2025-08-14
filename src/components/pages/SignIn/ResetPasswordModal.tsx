// components/auth/ResetPasswordModal.tsx
"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/hooks/useToast";
import { handleApiClientError } from "@/utils/handleApiClientError";

type Step = "email" | "pin" | "password";

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ResetPasswordModal({
  open,
  onClose,
}: ResetPasswordModalProps) {
  const { success } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [apiError, setApiError] = useState<string | null>(null);

  const handleClose = () => {
    onClose();
    setStep("email");
    setEmail("");
    setPin("");
    setApiError(null);
    emailForm.reset();
    pinForm.reset();
    passwordForm.reset();
  };

  // === Schemas ===
  const emailSchema = z.object({
    email: z.string().email("E-mail inválido"),
  });

  const pinSchema = z.object({
    pin: z.string().min(6, "O código deve ter 6 dígitos"),
  });

  const passwordSchema = z
    .object({
      newPassword: z.string().min(6, "Senha muito curta"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    });

  // === Forms ===
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const pinForm = useForm({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  // === Submits ===
  const handleEmailSubmit = async (data: any) => {
    setLoading(true);
    setApiError(null);
    try {
      await api.post("/api/auth/send-reset-pin", { email: data.email });
      setEmail(data.email);
      setStep("pin");
      success("Código enviado para seu e-mail!");
    } catch (err) {
      setApiError(handleApiClientError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (data: any) => {
    setLoading(true);
    setApiError(null);
    try {
      await api.post("/api/auth/validate-reset-pin", {
        email,
        pin: data.pin,
      });
      setPin(data.pin);
      setStep("password");
      success("Código validado. Agora crie sua nova senha.");
    } catch (err) {
      setApiError(handleApiClientError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: any) => {
    setLoading(true);
    setApiError(null);
    try {
      await api.post("/api/auth/reset-password", {
        email,
        pin,
        newPassword: data.newPassword,
      });
      success("Senha redefinida com sucesso!");
      handleClose();
    } catch (err) {
      setApiError(handleApiClientError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Redefinir senha</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        {apiError && (
          <Typography color="error" variant="body2" mb={2}>
            {apiError}
          </Typography>
        )}

        {step === "email" && (
          <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} noValidate>
            <Stack spacing={2} mt={2}>
              <Typography variant="body2">
                Informe seu e-mail para receber um código de verificação.
              </Typography>
              <FormControl>
                <FormLabel>E-mail</FormLabel>
                <Controller
                  name="email"
                  control={emailForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="email"
                      fullWidth
                      error={!!emailForm.formState.errors.email}
                      helperText={emailForm.formState.errors.email?.message?.toString()}
                      disabled={loading}
                    />
                  )}
                />
              </FormControl>
            </Stack>
          </form>
        )}

        {step === "pin" && (
          <form onSubmit={pinForm.handleSubmit(handlePinSubmit)} noValidate>
            <Stack spacing={2} mt={2}>
              <Typography variant="body2">
                Digite o código de 6 dígitos enviado para{" "}
                <strong>{email}</strong>.
              </Typography>
              <FormControl>
                <FormLabel>Código PIN</FormLabel>
                <Controller
                  name="pin"
                  control={pinForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      inputMode="numeric"
                      fullWidth
                      error={!!pinForm.formState.errors.pin}
                      helperText={pinForm.formState.errors.pin?.message?.toString()}
                      disabled={loading}
                    />
                  )}
                />
              </FormControl>
            </Stack>
          </form>
        )}

        {step === "password" && (
          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            noValidate
          >
            <Stack spacing={2} mt={2}>
              <Typography variant="body2">
                Digite sua nova senha abaixo.
              </Typography>
              <FormControl>
                <FormLabel>Nova senha</FormLabel>
                <Controller
                  name="newPassword"
                  control={passwordForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="password"
                      fullWidth
                      error={!!passwordForm.formState.errors.newPassword}
                      helperText={passwordForm.formState.errors.newPassword?.message?.toString()}
                      disabled={loading}
                    />
                  )}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Confirmar nova senha</FormLabel>
                <Controller
                  name="confirmPassword"
                  control={passwordForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="password"
                      fullWidth
                      error={!!passwordForm.formState.errors.confirmPassword}
                      helperText={passwordForm.formState.errors.confirmPassword?.message?.toString()}
                      disabled={loading}
                    />
                  )}
                />
              </FormControl>
            </Stack>
          </form>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={
            step === "email"
              ? emailForm.handleSubmit(handleEmailSubmit)
              : step === "pin"
                ? pinForm.handleSubmit(handlePinSubmit)
                : passwordForm.handleSubmit(handlePasswordSubmit)
          }
          disabled={loading}
          variant="contained"
        >
          {step === "email"
            ? "Enviar código"
            : step === "pin"
              ? "Validar código"
              : "Redefinir senha"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
