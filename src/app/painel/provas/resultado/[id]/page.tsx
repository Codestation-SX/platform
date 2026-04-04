"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  Button,
} from "@mui/material";

type Resultado = {
  notaPercentual: number;
  aprovado: boolean;
  totalPerguntas: number;
  totalAcertos: number;
  provaTitulo: string;
};

export default function ResultadoProvaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    fetch(`/api/painel/provas/resultado/${params.id}`)
      .then((res) => res.json())
      .then((data) => setResultado(data));
  }, [params.id]);

  if (!resultado) {
    return (
      <Container sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Stack spacing={3} alignItems="center">

            <Typography variant="h4" fontWeight={700}>
              Resultado da prova
            </Typography>

            <Typography variant="h6">
              {resultado.provaTitulo}
            </Typography>

            <Chip
              label={`Nota: ${resultado.notaPercentual}%`}
              color={resultado.aprovado ? "success" : "error"}
            />

            <Typography>
              Acertos: {resultado.totalAcertos} / {resultado.totalPerguntas}
            </Typography>

            <Typography variant="h5" fontWeight={700}>
              {resultado.aprovado ? "APROVADO" : "REPROVADO"}
            </Typography>

            <Button
              variant="contained"
              onClick={() => router.push("/painel/notas")}
            >
              Minhas notas
            </Button>

          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}