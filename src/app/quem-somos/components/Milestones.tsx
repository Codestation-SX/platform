import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";

const milestones = [
  {
    year: "O começo",
    title: "Mesa na garagem",
    desc: "Encontros informais para ensinar lógica, carreira e currículo — tudo no improviso e com muita vontade de ajudar.",
  },
  {
    year: "O salto",
    title: "Estrutura profissional",
    desc: "A demanda cresce, saímos da garagem e adotamos processos, trilhas e um ambiente de aprendizagem moderno.",
  },
  {
    year: "Hoje",
    title: "Escola reconhecida",
    desc: "Com foco em QA e tecnologia, seguimos transformando vidas com ensino acessível, prático e orientado ao mercado.",
  },
];

export default function Milestones() {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        <Typography variant="overline" color="text.secondary">
          Linha do tempo
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          Marcos da nossa jornada
        </Typography>

        <Grid container spacing={3}>
          {milestones.map((m, idx) => (
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
              key={idx}
            >
              <Paper
                variant="outlined"
                sx={{ p: 3, height: "100%", borderRadius: 3 }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  {m.year}
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5, mb: 1 }}>
                  {m.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {m.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
