"use client";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const faqs = [
  {
    q: "A CodeStation é focada em quê?",
    a: "Somos especialistas em QA e formação voltada para o mercado de tecnologia, com trilhas práticas e mentoria.",
  },
  {
    q: "As aulas são online?",
    a: "Sim. Nascemos presenciais, mas evoluímos para um modelo online com estrutura profissional e acolhedora.",
  },
  {
    q: "Como funciona o suporte?",
    a: "Você conta com comunidade ativa, sessões ao vivo (conforme trilha) e feedback dos instrutores.",
  },
];

export default function FAQ() {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Typography variant="overline" color="text.secondary">
          Dúvidas frequentes
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          FAQ — Quem Somos
        </Typography>

        {faqs.map((item, idx) => (
          <Accordion
            key={idx}
            disableGutters
            elevation={0}
            sx={{ mb: 1, borderRadius: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                {item.q}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                {item.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Box>
  );
}
