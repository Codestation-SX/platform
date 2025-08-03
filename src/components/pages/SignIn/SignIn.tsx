// import { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Link,
  TextField,
  Typography,
} from "@mui/material";
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

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  remember: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignIn({ role }: { role?: Role }) {
  const router = useRouter();
  const [loginError, setLoginError] = useState<string | null>(null);
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
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.ok) {
        router.push(role === "admin" ? "/backoffice" : "/painel");
      }
    } catch (err) {
      setLoginError("Credenciais inválidas. Tente novamente.");
    }
  };

  return (
    <StyledContainer direction="column" justifyContent="space-between">
      <StyledCard>
        <Typography component="h1" fontWeight={700}>
          CodeStation
        </Typography>
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
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
                  placeholder="your@email.com"
                  fullWidth
                  variant="outlined"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />
              )}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  id="password"
                  type="password"
                  placeholder="••••••"
                  fullWidth
                  variant="outlined"
                  error={!!errors.password}
                  helperText={errors.password?.message}
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

          <Grid container alignItems={"center"}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Link
                component={LinkNext}
                type="button"
                href={role === "student" ? "/admin/login" : "/login"}
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                {role === "student" ? "Sou colaborador" : "Sou aluno"}
              </Link>
            </Grid>
            {/* <Grid size={{ xs: 12, md: 6 }}>
              <Link
                component="button"
                type="button"
                onClick={() => console.log(true)}
                variant="body2"
                sx={{ alignSelf: "center" }}
              >
                Esqueceu a senha?
              </Link>
            </Grid> */}
          </Grid>
        </Box>
      </StyledCard>
    </StyledContainer>
  );
}
