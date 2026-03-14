"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import useSWR from "swr";
import { handleApiClientError } from "@/utils/handleApiClientError";
import { useToast } from "@/components/hooks/useToast";

const unitSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  turmaId: z.string().optional().nullable(),
});

type UnitFormData = z.infer<typeof unitSchema>;

const fetcher = (url: string) => api.get(url).then((r) => r.data);

export default function UnitModal({
  id,
  onClose,
  onSaved,
  open,
}: {
  id?: string;
  onClose: () => void;
  onSaved: () => void;
  open: boolean;
}) {
  const { success } = useToast();
  const isEdit = !!id;

  const { data: unitData } = useSWR(
    isEdit ? `/api/backoffice/units/${id}` : null,
    fetcher
  );

  const { data: turmasData } = useSWR("/api/backoffice/turmas", fetcher);
  const turmas: { id: string; nome: string }[] = turmasData ?? [];

  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: { title: "", description: "", turmaId: "" },
  });

  useEffect(() => {
    if (unitData) {
      reset({
        title: unitData.title,
        description: unitData.description,
        turmaId: unitData.turmaId ?? "",
      });
    } else {
      reset({ title: "", description: "", turmaId: "" });
    }
  }, [reset, unitData]);

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);
    setApiError(null);
    try {
      await api.request({
        url: "/api/backoffice/units",
        method: id ? "PUT" : "POST",
        data: {
          id,
          ...data,
          turmaId: data.turmaId || null,
        },
      });
      success(`Módulo ${isEdit ? "editado" : "criado"} com sucesso!`);
      onSaved();
    } catch (error) {
      setApiError(handleApiClientError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{id ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
      <DialogContent>
        {apiError && (
          <Typography color="error" variant="body2" mb={1}>
            {apiError}
          </Typography>
        )}
        <Box
          component="form"
          noValidate
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <FormControl>
            <FormLabel>Título</FormLabel>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  disabled={loading}
                />
              )}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Descrição</FormLabel>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  disabled={loading}
                />
              )}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Turma</FormLabel>
            <Controller
              name="turmaId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  value={field.value ?? ""}
                  disabled={loading}
                  helperText="Opcional — vincule este módulo a uma turma"
                >
                  <MenuItem value="">Nenhuma turma</MenuItem>
                  {turmas.map((t) => (
                    <MenuItem key={t.id} value={t.id}>
                      {t.nome}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={loading}
          variant="contained"
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
