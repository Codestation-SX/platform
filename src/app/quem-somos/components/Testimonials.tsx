"use client";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

const testimonials = [
  {
    name: "Aline S.",
    role: "QA Analyst",
    text: "Entrei sem base e saí com emprego na área. A didática e o suporte fizeram toda a diferença.",
  },
  {
    name: "Carlos M.",
    role: "SRE (ex-aluno)",
    text: "O foco prático acelera muito. Construí portfólio e me senti pronto para entrevistas.",
  },
  {
    name: "Joana R.",
    role: "Estudante",
    text: "A comunidade é incrível. Sempre tem alguém para ajudar, inclusive os professores.",
  },
];

export default function Testimonials() {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography variant="overline" color="text.secondary">
          Depoimentos
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          O que dizem nossos alunos
        </Typography>

        <Grid container spacing={3}>
          {testimonials.map((t, idx) => (
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
              key={idx}
            >
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: 3, height: "100%" }}
              >
                <Typography variant="body1" sx={{ mb: 1 }}>
                  “{t.text}”
                </Typography>
                <Typography variant="subtitle2">{t.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.role}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
