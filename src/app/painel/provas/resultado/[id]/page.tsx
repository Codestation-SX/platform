"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Button,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

type Alternativa = {
  id: string;
  texto: string;
  correta: boolean;
  selecionada: boolean;
};

type PerguntaGabarito = {
  id: string;
  enunciado: string;
  ordem: number;
  valorNota: number;
  acertou: boolean;
  alternativas: Alternativa[];
};

type Resultado = {
  notaPercentual: number;
  aprovado: boolean;
  totalPerguntas: number;
  totalAcertos: number;
  notaObtida: number;
  notaTotal: number;
  provaTitulo: string;
  perguntas: PerguntaGabarito[];
};

export default function ResultadoProvaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch(`/api/painel/provas/resultado/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setErro(data.error);
        else setResultado(data);
      })
      .catch(() => setErro("Erro ao carregar resultado."));
  }, [params.id]);

  if (erro) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{erro}</Alert>
      </Container>
    );
  }

  if (!resultado) {
    return (
      <Container sx={{ py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        {/* Resumo */}
        <Card>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <Typography variant="h4" fontWeight={700}>
                Resultado da prova
              </Typography>

              <Typography variant="h6">{resultado.provaTitulo}</Typography>

              <Chip
                label={`Nota: ${resultado.notaPercentual}%`}
                color={resultado.aprovado ? "success" : "error"}
                sx={{ fontSize: 16, px: 2, py: 3 }}
              />

              <Stack direction="row" spacing={4}>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Acertos
                  </Typography>
                  <Typography fontWeight={700}>
                    {resultado.totalAcertos} / {resultado.totalPerguntas}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="body2" color="text.secondary">
                    Nota obtida
                  </Typography>
                  <Typography fontWeight={700}>
                    {resultado.notaObtida} / {resultado.notaTotal}
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="h5" fontWeight={700} color={resultado.aprovado ? "success.main" : "error.main"}>
                {resultado.aprovado ? "APROVADO" : "REPROVADO"}
              </Typography>

              <Button variant="contained" onClick={() => router.push("/painel/notas")}>
                Minhas notas
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Gabarito */}
        {resultado.perguntas?.length > 0 && (
          <Box>
            <Typography variant="h5" fontWeight={700} mb={2}>
              Gabarito
            </Typography>

            <Stack spacing={2}>
              {resultado.perguntas.map((pergunta, idx) => (
                <Card
                  key={pergunta.id}
                  variant="outlined"
                  sx={{
                    borderColor: pergunta.acertou ? "success.main" : "error.main",
                    borderWidth: 2,
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Typography fontWeight={700}>
                          {idx + 1}. {pergunta.enunciado}
                        </Typography>
                        <Chip
                          icon={pergunta.acertou ? <CheckCircleIcon /> : <CancelIcon />}
                          label={pergunta.acertou ? "Acertou" : "Errou"}
                          color={pergunta.acertou ? "success" : "error"}
                          size="small"
                          sx={{ ml: 1, flexShrink: 0 }}
                        />
                      </Stack>

                      <Divider />

                      <Stack spacing={1}>
                        {pergunta.alternativas.map((alt) => {
                          let icon = <RadioButtonUncheckedIcon fontSize="small" sx={{ color: "text.disabled" }} />;
                          let bgColor = "transparent";
                          let fontWeight: number | string = "normal";
                          let textColor = "text.secondary";
                          let label: string | null = null;

                          if (alt.correta && alt.selecionada) {
                            icon = <CheckCircleIcon fontSize="small" color="success" />;
                            bgColor = "success.50";
                            fontWeight = 700;
                            textColor = "success.dark";
                            label = "Sua resposta ✓";
                          } else if (alt.correta && !alt.selecionada) {
                            icon = <CheckCircleIcon fontSize="small" color="success" />;
                            fontWeight = 700;
                            textColor = "success.dark";
                            label = "Resposta correta";
                          } else if (!alt.correta && alt.selecionada) {
                            icon = <CancelIcon fontSize="small" color="error" />;
                            bgColor = "error.50";
                            textColor = "error.dark";
                            label = "Sua resposta ✗";
                          }

                          return (
                            <Stack
                              key={alt.id}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{
                                px: 1.5,
                                py: 1,
                                borderRadius: 1,
                                bgcolor: bgColor,
                              }}
                            >
                              {icon}
                              <Typography
                                variant="body2"
                                fontWeight={fontWeight}
                                color={textColor}
                                flex={1}
                              >
                                {alt.texto}
                              </Typography>
                              {label && (
                                <Typography variant="caption" color={textColor} fontWeight={700}>
                                  {label}
                                </Typography>
                              )}
                            </Stack>
                          );
                        })}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
