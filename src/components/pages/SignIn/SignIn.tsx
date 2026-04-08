// import { useState } from "react";
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  ThemeProvider,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { backofficeTheme } from "@/theme/backofficeTheme";
import LinkNext from "next/link";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { StyledCard } from "@/components/core/StyledCard";
import { StyledContainer } from "@/components/core/StyledContainer";
import { Role } from "@/types/user";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ResetPasswordModal from "./ResetPasswordModal";

const signInSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  remember: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn({ role }: { role?: Role }) {
  const router = useRouter();
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setLoginError(null);
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.ok) {
        router.push(role === "admin" ? "/backoffice" : "/painel");
      }

      if (res?.error) {
        setLoginError("Credenciais inválidas. Tente novamente.");
      }
    } catch (err) {
      setLoginError(
        "Erro ao tentar fazer login. Por favor, tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={backofficeTheme}>
      <CssBaseline />
      <div className="backoffice-shell">
      <StyledContainer direction="column" justifyContent="space-between">
        <Backdrop
          open={isLoading}
          sx={{
            color: "#63b3ed",
            zIndex: (t) => t.zIndex.modal + 1,
            backdropFilter: "blur(4px)",
            bgcolor: "rgba(5,8,16,0.6)",
          }}
          aria-label="Carregando"
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <StyledCard sx={{ maxWidth: 480 }}>
          <Box sx={{ width: "100%", mb: -1 }}>
            <IconButton component={LinkNext} href="/" size="small" sx={{ color: "text.secondary" }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
          </Box>
          <Typography
            component="h1"
            fontWeight={800}
            sx={{
              fontFamily: "var(--font-syne, sans-serif)",
              fontSize: "1.1rem",
              letterSpacing: "1px",
              color: "#63b3ed",
            }}
          >
            CODE<span style={{ color: "#e2e8f0" }}>STATION</span>
          </Typography>
          <Typography
            component="h2"
            variant="h5"
            sx={{ width: "100%", fontWeight: 700, color: "text.primary" }}
          >
            {role === "student" ? "Área do aluno" : "Backoffice"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Digite seu email"
                    fullWidth
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </FormControl>

            <FormControl>
              <FormLabel htmlFor="password">Senha</FormLabel>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••"
                    fullWidth
                    variant="outlined"
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((v) => !v)}
                            edge="end"
                            size="small"
                            sx={{ border: "none", backgroundColor: "transparent", "&:hover": { backgroundColor: "transparent" } }}
                          >
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </FormControl>
            {loginError && (
              <Typography color="error" variant="body2">
                {loginError}
              </Typography>
            )}
            <Button type="submit" fullWidth variant="contained">
              {role === "student" ? "Entrar" : "Acessar Backoffice"}
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Link
                component={LinkNext}
                type="button"
                href={role === "student" ? "/admin/login" : "/login"}
                variant="body2"
              >
                {role === "student" ? "Sou colaborador" : "Sou aluno"}
              </Link>
              <Link
                component="button"
                type="button"
                onClick={() => setResetPasswordOpen(true)}
                variant="body2"
              >
                Esqueceu a senha?
              </Link>
            </Box>
          </Box>
        </StyledCard>
      </StyledContainer>
      </div>
      <ResetPasswordModal
        open={resetPasswordOpen}
        onClose={() => setResetPasswordOpen(false)}
      />
    </ThemeProvider>
  );
}
