"use client";
import { Button, Container, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
export default function Dashboard() {
  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: { xs: 14, sm: 20 },
        pb: { xs: 8, sm: 12 },
      }}
    >
      <Stack
        spacing={2}
        useFlexGap
        sx={{ alignItems: "center", width: { xs: "100%", sm: "70%" } }}
      >
        <Typography
          variant="h3"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            fontSize: "32px",
          }}
        >
          Seja bem vindo á&nbsp;
          <Typography
            component="span"
            variant="h3"
            sx={(theme) => ({
              fontSize: "inherit",
              color: "primary.main",
              ...theme.applyStyles("dark", {
                color: "primary.light",
              }),
            })}
          >
            CODESTATION
          </Typography>
        </Typography>
        <Button
          LinkComponent={NextLink}
          variant="outlined"
          color="secondary"
          href="/painel/aulas"
        >
          Acessar as aulas
        </Button>
      </Stack>
    </Container>
  );
}
