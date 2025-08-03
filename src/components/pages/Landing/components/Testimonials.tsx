import * as React from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";

const userTestimonials = [
  {
    avatar: <Avatar alt="João Oliveira" />,
    name: "João Oliveira",
    occupation: "Analista de QA Júnior",
    testimonial:
      "A CodeStation mudou completamente minha forma de enxergar testes. Os cursos são práticos, objetivos e me ajudaram a conseguir meu primeiro emprego na área.",
  },
  {
    avatar: <Avatar alt="Marina Costa" />,
    name: "Marina Costa",
    occupation: "QA Pleno",
    testimonial:
      "Os conteúdos são atualizados e cobrem desde fundamentos até ferramentas como Cypress e Postman. A mentoria foi essencial para minha evolução.",
  },
  {
    avatar: <Avatar alt="Carlos Lima" />,
    name: "Carlos Lima",
    occupation: "QA Sênior",
    testimonial:
      "O suporte da equipe é excelente e os cursos têm foco direto em mercado de trabalho. Recomendo fortemente para quem quer crescer em QA.",
  },
  {
    avatar: <Avatar alt="Lúcia Mendes" />,
    name: "Lúcia Mendes",
    occupation: "Estudante de TI",
    testimonial:
      "Comecei sem saber nada de testes e hoje já consigo automatizar cenários de teste completos. Obrigado CodeStation!",
  },
  {
    avatar: <Avatar alt="Felipe Rocha" />,
    name: "Felipe Rocha",
    occupation: "Desenvolvedor e QA",
    testimonial:
      "Como dev, os cursos me ajudaram a melhorar a qualidade dos meus próprios sistemas. Aprendi a pensar como QA e isso mudou meu processo.",
  },
  {
    avatar: <Avatar alt="Renata Silva" />,
    name: "Renata Silva",
    occupation: "Tech Recruiter",
    testimonial:
      "Indico os cursos da CodeStation para quem busca recolocação ou quer iniciar na área de QA. Os alunos saem muito bem preparados.",
  },
];

export default function Testimonials() {
  return (
    <Container
      id="testimonials"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
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
        <Typography
          component="h2"
          variant="h4"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          Depoimentos de alunos
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Veja o que nossos alunos dizem sobre os cursos da CodeStation.
          Descubra como nossos conteúdos de QA estão transformando carreiras com
          qualidade, didática e suporte de excelência.
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {userTestimonials.map((testimonial, index) => (
          <Grid
            size={{ xs: 12, sm: 6, md: 4 }}
            key={index}
            sx={{ display: "flex" }}
          >
            <Card
              variant="outlined"
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexGrow: 1,
              }}
            >
              <CardContent>
                <Typography
                  variant="body1"
                  gutterBottom
                  sx={{ color: "text.secondary" }}
                >
                  {testimonial.testimonial}
                </Typography>
              </CardContent>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <CardHeader
                  avatar={testimonial.avatar}
                  title={testimonial.name}
                  subheader={testimonial.occupation}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
