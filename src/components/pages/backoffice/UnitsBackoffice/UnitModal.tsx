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
});

type UnitFormData = z.infer<typeof unitSchema>;

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
    async (url: string) => {
      const res = await api.get(url);
      return res.data;
    }
  );
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitFormData>({
    resolver: zodResolver(unitSchema),
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (unitData) {
      reset({
        title: unitData.title,
        description: unitData.description,
      });
    } else {
      reset({ title: "", description: "" });
    }
  }, [reset, unitData]);

  const onSubmit = async (data: UnitFormData) => {
    setLoading(true);
    setApiError(null); // limpa erro anterior
    try {
      await api.request({
        url: "/api/backoffice/units",
        method: id ? "PUT" : "POST",
        data: { id, ...data },
      });
      success(`Unidade ${isEdit ? "editada" : "criada"} com sucesso!`);
      onSaved();
    } catch (error) {
      setApiError(handleApiClientError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{id ? "Editar Unidade" : "Nova Unidade"}</DialogTitle>
      <DialogContent>
        {apiError && (
          <Typography color="error" variant="body2">
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
                  disabled={loadingRequest}
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
                  disabled={loadingRequest}
                />
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
