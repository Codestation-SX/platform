import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import StyledContainer from "@/components/core/StyledContainer";
import StyledCard from "@/components/core/StyledCard";
import { registerSchema, RegisterFormData } from "./validations";
import { api } from "@/lib/api";
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

export default function RegisterForm() {
  const { success, error } = useToast();
  const router = useRouter();
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 90,
    today.getMonth(),
    today.getDate()
  );
  const maxDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate()
  );

  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      cpf: "",
      birthDate: undefined,
      educationLevel: "",
      email: "",
      password: "",
      confirmPassword: "",
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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const formattedDate = format(data.birthDate, "yyyy-MM-dd");
      const payload = {
        ...data,
        birthDate: formattedDate,
      };
      const response = await api.post("/api/public/register/student", payload);
      console.log({ response });

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (!!result?.ok) {
        router.push("/painel");
        success(`Cadastro criado com sucesso! Redirecionando...`);
      } else {
        error(`Ocorreu um erro com o cadastro`);
      }
    } catch (error) {
      console.error("Erro no envio:", error);
    }
  };

  return (
    <StyledContainer direction="column" justifyContent="space-between">
      <StyledCard>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{ p: 2, maxWidth: 1280, mx: "auto" }}
        >
          <Typography variant="h5" mb={2}>
            Formulário de Matrícula
          </Typography>

          {/* Seção: Informações Pessoais */}
          <Typography variant="h6" mt={4} mb={1}>
            Informações Pessoais
          </Typography>

          <Grid container spacing={2}>
            {["firstName", "lastName", "rg", "cpf"].map((name) => (
              <Grid key={name} size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <FormLabel>
                    {name === "firstName"
                      ? "Nome"
                      : name === "lastName"
                        ? "Sobrenome"
                        : name === "rg"
                          ? "RG"
                          : "CPF"}
                  </FormLabel>
                  <Controller
                    name={name as keyof RegisterFormData}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        value={field.value ?? ""}
                        error={!!error?.message}
                        helperText={error?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            ))}
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
            <Grid size={{ xs: 12, md: 7 }}>
              <FormControl fullWidth>
                <FormLabel>Data de nascimento</FormLabel>
                <Controller
                  name="birthDate"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <DatePicker
                      {...field}
                      disableFuture
                      label={null}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!error?.message,
                          helperText: error?.message,
                        },
                      }}
                      maxDate={maxDate}
                      minDate={minDate}
                      format="dd/MM/yyyy"
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                    />
                  )}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" mt={4} mb={1}>
            Contato e Acesso
          </Typography>

          <Grid container spacing={2}>
            {/* Seção: Contato e Acesso */}
            {["email", "password", "confirmPassword"].map((name) => (
              <Grid key={name} size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <FormLabel>
                    {name === "email"
                      ? "E-mail"
                      : name === "password"
                        ? "Senha"
                        : "Confirmar senha"}
                  </FormLabel>
                  <Controller
                    name={name as keyof RegisterFormData}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        type={
                          name.includes("password") ||
                          name.includes("confirmPassword")
                            ? "password"
                            : "text"
                        }
                        fullWidth
                        value={field.value ?? ""}
                        error={!!error?.message}
                        helperText={error?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" mt={4} mb={1}>
            Endereço
          </Typography>

          <Grid container spacing={2}>
            {/* Seção: Endereço */}

            {[
              "zipCode",
              "street",
              "state",
              "city",
              "neighborhood",
              "number",
              "complement",
            ].map((name) => (
              <Grid key={name} size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <FormLabel>
                    {name === "zipCode"
                      ? "CEP"
                      : name === "state"
                        ? "Estado"
                        : name === "city"
                          ? "Cidade"
                          : name === "neighborhood"
                            ? "Bairro"
                            : name === "street"
                              ? "Endereço"
                              : name === "number"
                                ? "Número"
                                : "Complemento"}
                  </FormLabel>
                  <Controller
                    name={`address.${name}` as keyof RegisterFormData}
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <TextField
                        {...field}
                        fullWidth
                        value={field.value ?? ""}
                        error={!!error?.message}
                        helperText={error?.message}
                      />
                    )}
                  />
                </FormControl>
              </Grid>
            ))}

            <Grid
              size={{ xs: 12 }}
              mt={4}
              sx={{
                display: "flex",
                gap: 1,
              }}
            >
              <Button
                type="button"
                variant="contained"
                sx={{
                  lg: {
                    width: "300px",
                  },
                }}
                onClick={() => {
                  router.push("/");
                }}
              >
                voltar
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  lg: {
                    width: "300px",
                  },
                }}
              >
                Cadastrar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </StyledCard>
    </StyledContainer>
  );
}
