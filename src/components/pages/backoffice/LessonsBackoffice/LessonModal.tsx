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
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { handleApiClientError } from "@/utils/handleApiClientError";
import { useToast } from "@/components/hooks/useToast";

const lessonSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  videoUrl: z.string().url("URL inválida"),
  duration: z.coerce.number().positive("Deve ser um número positivo"),
  isFree: z.boolean(),
  unitId: z.string().min(1, "Unidade é obrigatória"),
});

type LessonFormData = z.infer<typeof lessonSchema>;

type Props = {
  id?: string;
  onClose: () => void;
  onSaved: () => void;
  open: boolean;
};

export default function LessonModal({ id, onClose, onSaved, open }: Props) {
  const isEdit = !!id;
  const { success } = useToast();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { data: lessonData } = useSWR(
    isEdit ? `/api/backoffice/lessons/${id}` : null,
    async (url: string) => {
      const res = await api.get(url);
      return res.data;
    }
  );
  const { data: units } = useSWR(
    "/api/backoffice/units",
    async (url: string) => {
      const res = await api.get(url);
      return res.data;
    }
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      videoUrl: "",
      duration: 0,
      isFree: false,

      unitId: "",
    },
  });

  useEffect(() => {
    if (isEdit && lessonData) {
      reset(lessonData);
    } else {
      reset({
        title: "",
        videoUrl: "",
        duration: 0,
        isFree: false,

        unitId: "",
      });
    }
  }, [isEdit, lessonData, reset]);

  const onSubmit = async (data: LessonFormData) => {
    setLoading(true);
    const method = isEdit ? "PUT" : "POST";
    try {
      await api.request({
        url: "/api/backoffice/lessons",
        method,
        data: isEdit ? { ...data, id } : data,
        headers: { "Content-Type": "application/json" },
      });

      onSaved();
      reset({
        title: "",
        videoUrl: "",
        duration: 0,
        isFree: false,

        unitId: "",
      });
      success(`Lição ${isEdit ? "editada" : "criada"} com sucesso!`);
    } catch (error) {
      setApiError(handleApiClientError(error));
    } finally {
      setLoading(false);
    }
  };
  console.log({ lessonData, isValid });
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Editar Aula" : "Nova Aula"}</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
      >
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
            <FormLabel htmlFor="title">Título</FormLabel>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="title"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="videoUrl">URL do Vídeo</FormLabel>
            <Controller
              name="videoUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="videoUrl"
                  fullWidth
                  error={!!errors.videoUrl}
                  helperText={errors.videoUrl?.message}
                />
              )}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="duration">Duração (segundos)</FormLabel>
            <Controller
              name="duration"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="duration"
                  type="number"
                  fullWidth
                  error={!!errors.duration}
                  helperText={errors.duration?.message}
                />
              )}
            />
          </FormControl>

          <FormControlLabel
            control={
              <Controller
                name="isFree"
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value} />
                )}
              />
            }
            label="Aula gratuita"
          />

          <FormControl>
            <FormLabel htmlFor="unitId">Unidade</FormLabel>
            <Controller
              name="unitId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="unitId"
                  select
                  fullWidth
                  SelectProps={{ native: true }}
                  error={!!errors.unitId}
                  helperText={errors.unitId?.message}
                >
                  <option value="">Selecione...</option>
                  {units?.data?.items.map((unit: any) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.title}
                    </option>
                  ))}
                </TextField>
              )}
            />
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} type="button">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit(onSubmit)}
          disabled={loading || !isValid}
        >
          {isEdit ? "Salvar" : "Criar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
