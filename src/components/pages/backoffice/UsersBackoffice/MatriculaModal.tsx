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
  Alert,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { api } from "@/lib/api";
import { handleApiClientError } from "@/utils/handleApiClientError";
import { useToast } from "@/components/hooks/useToast";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";

const educationLevels = [
  { value: "NONE", label: "Sem escolaridade" },
  { value: "ELEMENTARY", label: "Ensino fundamental completo" },
  { value: "ELEMENTARY_INCOMPLETE", label: "Ensino fundamental incompleto" },
  { value: "HIGH_SCHOOL", label: "Ensino médio completo" },
  { value: "HIGH_SCHOOL_INCOMPLETE", label: "Ensino médio incompleto" },
  { value: "COLLEGE", label: "Ensino superior completo" },
  { value: "COLLEGE_INCOMPLETE", label: "Ensino superior incompleto" },
];

const matriculaSchema = z.object({
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  cpf: z.string().min(11, "CPF inválido"),
  rg: z.string().optional(),
  phone: z.string().min(1, "Telefone é obrigatório"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  educationLevel: z.string().min(1, "Escolaridade é obrigatória"),
  address: z.object({
    zipCode: z.string().min(1, "CEP é obrigatório"),
    state: z.string().min(1, "Estado é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
  }),
});

type MatriculaFormData = z.infer<typeof matriculaSchema>;

export default function MatriculaModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { success } = useToast();
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [cepLoading, setCepLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<MatriculaFormData>({
    resolver: zodResolver(matriculaSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      cpf: "",
      rg: "",
      phone: "",
      birthDate: "",
      educationLevel: "",
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

  const onSubmit = async (data: MatriculaFormData) => {
    setLoading(true);
    setApiError(null);
    try {
      await api.post("/api/backoffice/matricula", data);
      success("Aluno matriculado com sucesso!");
      reset();
      onSaved();
    } catch (err) {
      const mensagem = handleApiClientError(err);
      if (mensagem.toLowerCase().includes("e-mail") || mensagem.toLowerCase().includes("email")) {
        setError("email", { message: mensagem });
      } else {
        setApiError(mensagem);
      }
    } finally {
      setLoading(false);
    }
  };

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await res.json();

      if (data.erro) {
        setError("address.zipCode", { message: "CEP não encontrado" });
        return;
      }

      clearErrors("address.zipCode");
      setValue("address.street", data.logradouro || "", { shouldValidate: true });
      setValue("address.neighborhood", data.bairro || "", { shouldValidate: true });
      setValue("address.city", data.localidade || "", { shouldValidate: true });
      setValue("address.state", data.uf || "", { shouldValidate: true });
    } catch {
      setError("address.zipCode", { message: "Erro ao buscar CEP" });
    } finally {
      setCepLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Matricular Aluno</DialogTitle>
      <DialogContent>
        <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
          Alunos matriculados pelo backoffice têm acesso imediato à plataforma,
          sem necessidade de pagamento.
        </Alert>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        {/* Informações Pessoais */}
        <Typography variant="h6" mt={2}>
          Informações Pessoais
        </Typography>
        <Grid container spacing={2} mt={1}>
          {(
            [
              ["firstName", "Nome", "text"],
              ["lastName", "Sobrenome", "text"],
              ["birthDate", "Data de Nascimento", "date"],
              ["phone", "Telefone", "tel"],
              ["email", "E-mail", "email"],
              ["password", "Senha inicial", "password"],
            ] as [keyof MatriculaFormData, string, string][]
          ).map(([name, label, type]) => (
            <Grid size={{ xs: 12, sm: 6 }} key={name}>
              <FormControl fullWidth>
                <FormLabel>{label}</FormLabel>
                <Controller
                  name={name}
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

        {/* Documentos */}
        <Typography variant="h6" mt={4}>
          Documentos
        </Typography>
        <Grid container spacing={2} mt={1}>
          {(
            [
              ["cpf", "CPF"],
              ["rg", "RG (opcional)"],
            ] as [keyof MatriculaFormData, string][]
          ).map(([name, label]) => (
            <Grid size={{ xs: 12, sm: 6 }} key={name}>
              <FormControl fullWidth>
                <FormLabel>{label}</FormLabel>
                <Controller
                  name={name}
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

        {/* Informações Acadêmicas */}
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

        {/* Endereço */}
        <Typography variant="h6" mt={4}>
          Endereço
        </Typography>
        <Grid container spacing={2} mt={1}>
          {/* CEP com busca automática */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <FormLabel>CEP</FormLabel>
              <Controller
                name="address.zipCode"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    error={!!error?.message}
                    helperText={error?.message ?? "Digite o CEP para preencher automaticamente"}
                    onChange={(e) => {
                      field.onChange(e);
                      buscarCep(e.target.value);
                    }}
                    slotProps={{
                      input: {
                        endAdornment: cepLoading ? (
                          <InputAdornment position="end">
                            <CircularProgress size={18} />
                          </InputAdornment>
                        ) : undefined,
                      },
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Demais campos de endereço */}
          {(
            [
              ["state", "Estado"],
              ["city", "Cidade"],
              ["neighborhood", "Bairro"],
              ["street", "Rua"],
              ["number", "Número"],
              ["complement", "Complemento"],
            ] as [string, string][]
          ).map(([name, label]) => (
            <Grid size={{ xs: 12, sm: 6 }} key={name}>
              <FormControl fullWidth>
                <FormLabel>{label}</FormLabel>
                <Controller
                  name={`address.${name}` as keyof MatriculaFormData}
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
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading}
        >
          {loading ? "Matriculando..." : "Matricular Aluno"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
