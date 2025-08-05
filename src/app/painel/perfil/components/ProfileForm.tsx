// app/painel/perfil/components/ProfileForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Stack, TextField } from "@mui/material";
import { z } from "zod";
import { useState } from "react";
import { api } from "@/lib/api";

const profileSchema = z.object({
  firstName: z.string().min(2, "Nome obrigatório"),
  lastName: z.string().min(2, "Sobrenome obrigatório"),
});

type ProfileData = z.infer<typeof profileSchema>;

export default function ProfileForm({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: ProfileData) => {
    setLoading(true);
    try {
      await api.put("/api/user/profile", data);
      alert("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={2}>
        <TextField
          label="Nome"
          {...register("firstName")}
          error={!!errors.firstName}
          helperText={errors.firstName?.message}
        />
        <TextField
          label="Sobrenome"
          {...register("lastName")}
          error={!!errors.lastName}
          helperText={errors.lastName?.message}
        />
        <TextField label="E-mail" type="email" value={email} disabled />
        <Button type="submit" variant="contained" disabled={loading}>
          Salvar alterações
        </Button>
      </Stack>
    </Box>
  );
}
