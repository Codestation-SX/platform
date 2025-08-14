"use client";

import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

export default function Hero() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0) 100%)",
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2} alignItems="center" textAlign="center">
          <Typography variant="h2" fontWeight={800}>
            Quem Somos
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 900 }}
          >
            Da mesa na garagem à escola reconhecida: nossa história é feita de
            generosidade, comunidade e transformação pela tecnologia.
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Button href="/matricula" size="large" variant="contained">
              Se inscreva
            </Button>
            {/* <Button href="/contato" size="large" variant="outlined">
              Fale com a gente
            </Button> */}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
