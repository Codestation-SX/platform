"use client";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

const values = [
  {
    title: "Generosidade",
    desc: "Nossa origem é compartilhar conhecimento. Mantemos esse espírito em cada turma, aula e feedback.",
  },
  {
    title: "Excelência prática",
    desc: "Conteúdo direto ao ponto, com exercícios e projetos reais — formação que prepara para o mercado.",
  },
  {
    title: "Transformação",
    desc: "Tecnologia muda vidas. Trabalhamos para criar oportunidades concretas e acessíveis.",
  },
  {
    title: "Comunidade",
    desc: "Crescemos juntos. Incentivamos networking, apoio entre alunos e mentoria contínua.",
  },
];

export default function Values() {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography variant="overline" color="text.secondary">
          Nossos valores
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          O que nos guia
        </Typography>

        <Grid container spacing={3}>
          {values.map((v, idx) => (
            <Grid
              size={{
                xs: 12,
                md: 6,
                lg: 3,
              }}
              key={idx}
            >
              <Paper
                variant="outlined"
                sx={{ p: 3, borderRadius: 3, height: "100%" }}
              >
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <CheckRoundedIcon fontSize="small" />
                  <Typography variant="h6">{v.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {v.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
