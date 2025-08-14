import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";

const paragraphs = [
  "Tudo começou de forma simples… e verdadeira. Era apenas uma mesa de jantar, colocada na garagem de casa. Uma lousa pequena apoiada na parede, um giz meio gasto, e uma ideia que não parecia tão grande naquele momento: ajudar alguns amigos a entrarem na área de Tecnologia da Informação.",
  "No início, era só isso — um gesto de generosidade. Um tempo separado no fim do dia para explicar, com calma e paciência, o que era lógica de programação, como funcionava o mercado de TI, como montar um currículo ou se preparar para uma entrevista. Não havia planos de negócio, nem metas de crescimento. Apenas vontade de ver outras pessoas conquistando algo melhor.",
  "Mas a notícia se espalhou. Um amigo indicou para outro, que indicou para mais dois. A garagem já não comportava mais tanta gente. E foi aí que percebemos: não era apenas uma ajuda, era uma missão.",
  "Com os olhos brilhando de quem via sua primeira linha de código funcionar, nossos alunos nos mostraram que estávamos criando algo maior. A demanda cresceu tanto que decidimos dar um passo adiante. Trocamos a garagem por uma estrutura profissional. A lousa deu lugar a plataformas online. E aquele espírito de acolhimento e transformação se manteve em cada novo capítulo.",
  "Hoje, o que começou com uma mesa na garagem se tornou uma escola reconhecida, com um propósito claro: transformar vidas através da educação em tecnologia.",
  "Mas nunca esquecemos de onde viemos. Porque toda grande história começa assim: com um coração disposto a ensinar… e uma garagem cheia de sonhos.",
];

export default function OurStory() {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="md">
        <Typography variant="overline" color="text.secondary">
          Nossa história
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          Da garagem para o mundo
        </Typography>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <Stack spacing={2}>
            {paragraphs.map((p, i) => (
              <Typography key={i} variant="body1" color="text.primary">
                {p}
              </Typography>
            ))}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
