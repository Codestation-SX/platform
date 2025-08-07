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
  MenuItem,
  Grid,
  Typography,
  Checkbox,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { handleApiClientError } from "@/utils/handleApiClientError";
import useSWR from "swr";
import { useToast } from "@/components/hooks/useToast";

const educationLevels = [
  { value: "NONE", label: "Sem escolaridade" },
  { value: "ELEMENTARY", label: "Ensino fundamental completo" },
  { value: "ELEMENTARY_INCOMPLETE", label: "Ensino fundamental incompleto" },
  { value: "HIGH_SCHOOL", label: "Ensino médio completo" },
  { value: "HIGH_SCHOOL_INCOMPLETE", label: "Ensino médio incompleto" },
  { value: "COLLEGE", label: "Ensino superior completo" },
  { value: "COLLEGE_INCOMPLETE", label: "Ensino superior incompleto" },
];

const addressSchema = z.object({
  zipCode: z.string().min(1, "CEP é obrigatório"),
  state: z.string().min(1, "Estado é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
});

const userSchema = z.object({
  id: z.string().optional(),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .optional(),
  rg: z.string().min(5, "RG inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  educationLevel: z.string().min(1, "Escolaridade é obrigatória"),
  role: z.enum(["admin", "student"]),
  address: addressSchema,
  paymentDeferred: z.boolean().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UserModal({
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
  const { data: userData } = useSWR(
    isEdit ? `/api/backoffice/users/${id}` : null,
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
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      rg: "",
      cpf: "",
      birthDate: "",
      educationLevel: "",
      role: "student",
      address: {
        zipCode: "",
        state: "",
        city: "",
        neighborhood: "",
        street: "",
        number: "",
        complement: "",
      },
    },
  });
  useEffect(() => {
    if (isEdit && userData) {
      reset({
        ...userData,
        birthDate: new Date(userData.birthDate).toISOString().split("T")[0],
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        rg: "",
        cpf: "",
        birthDate: "",
        educationLevel: "",
        role: "student",
        address: {
          zipCode: "",
          state: "",
          city: "",
          neighborhood: "",
          street: "",
          number: "",
          complement: "",
        },
      });
    }
  }, [isEdit, userData, reset]);

  const onSubmit = async (data: UserFormData) => {
    const method = id ? "PUT" : "POST";
    setLoading(true);
    try {
      await api.request({
        url: "/api/backoffice/users",
        method,
        data: id ? { ...data, id } : data,
      });
      success(`Usuário ${isEdit ? "editado" : "criado"} com sucesso!`);
      onSaved();
    } catch (error) {
      setApiError(handleApiClientError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{id ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
      <DialogContent>
        {apiError && (
          <Typography color="error" variant="body2">
            {apiError}
          </Typography>
        )}

        {/* 📘 Informações Pessoais */}
        <Typography variant="h6" mt={2}>
          Informações Pessoais
        </Typography>
        <Grid container spacing={2} mt={1}>
          {[
            ["firstName", "Nome", "text"],
            ["lastName", "Sobrenome", "text"],
            ["birthDate", "Data de Nascimento", "date"],
            ["email", "Email", "email"],
            ["password", "Senha", "password"],
          ].map(([name, label, type]) => (
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
              key={name}
            >
              <FormControl fullWidth>
                <FormLabel>{label}</FormLabel>
                <Controller
                  name={name as keyof UserFormData}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      value={field.value || ""}
                      type={type}
                      error={!!error?.message}
                      helperText={error?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>
          ))}
        </Grid>

        {/* 🧾 Documentos */}
        <Typography variant="h6" mt={4}>
          Documentos
        </Typography>
        <Grid container spacing={2} mt={1}>
          {[
            ["rg", "RG", "text"],
            ["cpf", "CPF", "text"],
          ].map(([name, label, type]) => (
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
              key={name}
            >
              <FormControl fullWidth>
                <FormLabel>{label}</FormLabel>
                <Controller
                  name={name as keyof UserFormData}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      type={type}
                      error={!!error?.message}
                      helperText={error?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>
          ))}
        </Grid>

        {/* 🎓 Informações Acadêmicas */}
        <Typography variant="h6" mt={4}>
          Informações Acadêmicas
        </Typography>
        <Grid container spacing={2} mt={1}>
          <Grid size={{ xs: 12, md: 7 }}>
            <FormControl fullWidth>
              <FormLabel>Escolaridade</FormLabel>
              <Controller
                name="educationLevel"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    select
                    {...field}
                    value={field.value ?? ""}
                    error={!!error?.message}
                    helperText={error?.message}
                  >
                    {educationLevels.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </FormControl>
          </Grid>
        </Grid>

        {/* ⚙️ Permissões e Acesso */}
        <Typography variant="h6" mt={4}>
          Permissões e Acesso
        </Typography>
        <Grid container spacing={2} mt={1}>
          <Grid
            size={{
              xs: 12,
              sm: 7,
            }}
          >
            <FormControl fullWidth>
              <FormLabel>Tipo de Usuário</FormLabel>
              <Controller
                name="role"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    select
                    error={!!error?.message}
                    helperText={error?.message}
                  >
                    <MenuItem value="student">Aluno</MenuItem>
                    <MenuItem value="admin">Administrador</MenuItem>
                  </TextField>
                )}
              />
            </FormControl>
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 7,
            }}
          >
            <FormControl fullWidth>
              <FormLabel>Permitir acesso sem pagamento (pós-emprego)</FormLabel>
              <Controller
                name="paymentDeferred"
                control={control}
                render={({ field }) => (
                  <Checkbox {...field} checked={field.value || false} />
                )}
              />
            </FormControl>
          </Grid>
        </Grid>

        {/* 🏡 Endereço */}
        <Typography variant="h6" mt={4}>
          Endereço
        </Typography>
        <Grid container spacing={2} mt={1}>
          {[
            ["zipCode", "CEP"],
            ["state", "Estado"],
            ["city", "Cidade"],
            ["neighborhood", "Bairro"],
            ["street", "Rua"],
            ["number", "Número"],
            ["complement", "Complemento"],
          ].map(([name, label]) => (
            <Grid
              size={{
                xs: 12,
                sm: 6,
              }}
              key={name}
            >
              <FormControl fullWidth>
                <FormLabel>{label}</FormLabel>
                <Controller
                  name={`address.${name}` as keyof UserFormData}
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      error={!!error?.message}
                      helperText={error?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
