import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import TerminalIcon from "@mui/icons-material/Terminal";

export default function Hero() {
  return (
    <Box
      id="hero"
      sx={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        backgroundImage:
          "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(99,179,237,0.08) 0%, transparent 70%)",
      }}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: { xs: 16, sm: 20 },
          pb: { xs: 10, sm: 14 },
        }}
      >
        <Stack
          spacing={3}
          useFlexGap
          sx={{ alignItems: "center", width: { xs: "100%", sm: "80%", md: "65%" } }}
        >
          <Chip
            icon={<TerminalIcon sx={{ fontSize: "0.875rem !important" }} />}
            label="// plataforma de QA"
            color="primary"
            size="small"
            sx={{ fontFamily: "var(--font-jetbrains, monospace)", letterSpacing: "1px" }}
          />

          <Typography
            variant="h1"
            sx={{
              textAlign: "center",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.4rem" },
              fontFamily: "var(--font-syne, sans-serif)",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "text.primary",
            }}
          >
            Aprenda{" "}
            <Box
              component="span"
              sx={{
                color: "primary.main",
                textShadow: "0 0 40px rgba(99,179,237,0.35)",
              }}
            >
              QA
            </Box>{" "}
            na prática e entre para o mercado de tecnologia
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              maxWidth: 520,
              lineHeight: 1.8,
            }}
          >
            Aprenda Testes de Software do zero ao avançado, com projetos reais,
            automação de testes e preparação para entrevistas.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            useFlexGap
            sx={{ pt: 1 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<RocketLaunchIcon />}
              LinkComponent={Link}
              href="/matricula"
              sx={{ px: 4 }}
            >
              Matricule-se
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              LinkComponent={Link}
              href="/login"
              sx={{ px: 4 }}
            >
              Acessar plataforma
            </Button>
          </Stack>

        </Stack>
      </Container>
    </Box>
  );
}
