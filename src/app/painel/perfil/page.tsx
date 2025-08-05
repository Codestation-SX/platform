// app/painel/perfil/page.tsx
"use client";

import { Box, Container, Typography, Divider } from "@mui/material";
import ProfileForm from "./components/ProfileForm";
import PasswordChangeForm from "./components/PasswordChangeForm";

export default function PerfilPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h5" gutterBottom>
        Alterar Senha
      </Typography>

      <PasswordChangeForm />
    </Container>
  );
}
