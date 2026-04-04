import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { format } from "date-fns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import StyledContainer from "@/components/core/StyledContainer";
import StyledCard from "@/components/core/StyledCard";
import { registerSchema, RegisterFormData } from "./validations";
import { api } from "@/lib/api";
import { useToast } from "@/components/hooks/useToast";
import { useState } from "react";

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
  const [cepLoading, setCepLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const { control, handleSubmit, setValue, setError, clearErrors } =
    useForm<RegisterFormData>({
      resolver: zodResolver(registerSchema),
      defaultValues: {
        firstName: "",
        lastName: "",
        cpf: "",
        birthDate: undefined,
        educationLevel: "",
        phone: "",
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
        terms: false,
      },
    });

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

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const formattedDate = format(data.birthDate, "yyyy-MM-dd");
      const payload = {
        ...data,
        birthDate: formattedDate,
      };
      await api.post("/api/public/register/student", payload);

      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.ok) {
        success("Cadastro realizado com sucesso!");
        router.push("/painel/pagamento");
      } else {
        error("Ocorreu um erro ao realizar o login. Tente novamente.");
      }
    } catch (err: any) {
      console.error("Erro no envio:", err);
      const mensagem =
        err?.response?.data?.error ||
        "Erro ao realizar cadastro. Tente novamente.";

      if (mensagem.toLowerCase().includes("e-mail") || mensagem.toLowerCase().includes("email")) {
        setError("email", { message: mensagem });
      } else {
        error(mensagem);
      }
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
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <FormLabel>Telefone</FormLabel>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      type="tel"
                      fullWidth
                      value={field.value ?? ""}
                      error={!!error?.message}
                      helperText={error?.message}
                    />
                  )}
                />
              </FormControl>
            </Grid>
            {["email", "password", "confirmPassword"].map((name) => {
              const isPassword = name === "password";
              const isConfirm = name === "confirmPassword";
              const isPasswordField = isPassword || isConfirm;
              const showValue = isPassword ? showPassword : showConfirmPassword;
              const toggleShow = isPassword
                ? () => setShowPassword((v) => !v)
                : () => setShowConfirmPassword((v) => !v);

              return (
                <Grid key={name} size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel>
                      {name === "email" ? "E-mail" : isPassword ? "Senha" : "Confirmar senha"}
                    </FormLabel>
                    <Controller
                      name={name as keyof RegisterFormData}
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <TextField
                          {...field}
                          type={isPasswordField && !showValue ? "password" : "text"}
                          fullWidth
                          value={field.value ?? ""}
                          error={!!error?.message}
                          helperText={error?.message}
                          slotProps={isPasswordField ? {
                            input: {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={toggleShow} edge="end" tabIndex={-1}>
                                    {showValue ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            },
                          } : undefined}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>
              );
            })}
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" mt={4} mb={1}>
            Endereço
          </Typography>

          <Grid container spacing={2}>
            {/* CEP com busca automática */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <FormLabel>CEP</FormLabel>
                <Controller
                  name="address.zipCode"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      value={field.value ?? ""}
                      error={!!error?.message}
                      helperText={error?.message ?? "Digite seu CEP"}
                      inputProps={{ maxLength: 8 }}
                      onBlur={(e) => {
                        field.onBlur();
                        buscarCep(e.target.value);
                      }}
                      InputProps={{
                        endAdornment: cepLoading ? (
                          <InputAdornment position="end">
                            <CircularProgress size={18} />
                          </InputAdornment>
                        ) : null,
                      }}
                    />
                  )}
                />
              </FormControl>
            </Grid>

            {/* Demais campos de endereço */}
            {["street", "state", "city", "neighborhood", "number", "complement"].map((name) => (
              <Grid key={name} size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <FormLabel>
                    {name === "state"
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

            {/* Termo de aceite */}
            <Grid size={{ xs: 12 }} mt={2}>
              <Controller
                name="terms"
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <FormControl error={!!error?.message}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          Li e aceito os{" "}
                          <strong>Termos de Uso</strong> e a{" "}
                          <strong>Política de Privacidade</strong> da Codestation
                        </Typography>
                      }
                    />
                    {error?.message && (
                      <FormHelperText>{error.message}</FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

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
                Voltar
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
