import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import ConstructionRoundedIcon from "@mui/icons-material/ConstructionRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import SettingsSuggestRoundedIcon from "@mui/icons-material/SettingsSuggestRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import ThumbUpAltRoundedIcon from "@mui/icons-material/ThumbUpAltRounded";

const items = [
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: "Aprendizado adaptável",
    description:
      "Nossos cursos se ajustam ao seu ritmo, otimizando sua jornada de aprendizado em QA com eficiência.",
  },
  {
    icon: <ConstructionRoundedIcon />,
    title: "Conteúdo sólido e confiável",
    description:
      "Construa uma base duradoura em testes de software com materiais pensados para o mercado real.",
  },
  {
    icon: <ThumbUpAltRoundedIcon />,
    title: "Experiência do aluno em primeiro lugar",
    description:
      "Interface intuitiva e acesso facilitado para que você aprenda com foco e sem distrações.",
  },
  {
    icon: <AutoFixHighRoundedIcon />,
    title: "Funcionalidades modernas",
    description:
      "Recursos atualizados que acompanham as tendências e práticas atuais da área de QA.",
  },
  {
    icon: <SupportAgentRoundedIcon />,
    title: "Suporte dedicado",
    description:
      "Conte com nosso time para tirar dúvidas, orientar sua trilha e apoiar seu desenvolvimento.",
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: "Precisão em cada detalhe",
    description:
      "Materiais cuidadosamente elaborados para garantir clareza, foco técnico e aplicabilidade.",
  },
];

export default function Highlights() {
  return (
    <Box
      id="highlights"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        color: "white",
        bgcolor: "grey.900",
      }}
    >
      <Container
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 3, sm: 6 },
        }}
      >
        <Box
          sx={{
            width: { sm: "100%", md: "60%" },
            textAlign: { sm: "left", md: "center" },
          }}
        >
          <Typography component="h2" variant="h4" gutterBottom>
            Por que escolher a CodeStation
          </Typography>
          <Typography variant="body1" sx={{ color: "grey.400" }}>
            Descubra o que torna nossa plataforma única: aprendizado adaptável,
            conteúdo atualizado, suporte dedicado e uma experiência completa
            para quem quer dominar QA de verdade.
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {items.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Stack
                direction="column"
                component={Card}
                spacing={1}
                useFlexGap
                sx={{
                  color: "inherit",
                  p: 3,
                  height: "100%",
                  borderColor: "hsla(220, 25%, 25%, 0.3)",
                  backgroundColor: "grey.800",
                }}
              >
                <Box sx={{ opacity: "50%" }}>{item.icon}</Box>
                <div>
                  <Typography gutterBottom sx={{ fontWeight: "medium" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "grey.400" }}>
                    {item.description}
                  </Typography>
                </div>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
