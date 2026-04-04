"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";

type ProvaDisponivel = {
  id: string;
  titulo: string;
  descricao?: string | null;
  tempoDuracaoMinutos: number;
  percentualMinimoAprovacao: number;
  status: string;
  dataInicioDisponibilidade: string;
  dataFimDisponibilidade: string;
};

type ProvaConcluida = {
  id: string;
  status: string;
  percentualAcerto: number | null;
  aprovado: boolean | null;
  dataFim: string | null;
  prova: {
    id: string;
    titulo: string;
    descricao?: string | null;
    tempoDuracaoMinutos: number;
    percentualMinimoAprovacao: number;
  };
};

export default function ProvasAlunoPage() {
  const [disponiveis, setDisponiveis] = useState<ProvaDisponivel[]>([]);
  const [concluidas, setConcluidas] = useState<ProvaConcluida[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        setErro("");
        const response = await fetch("/api/painel/provas", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Erro ao carregar provas.");
        setDisponiveis(result.disponiveis ?? []);
        setConcluidas(result.concluidas ?? []);
      } catch (error: any) {
        setErro(error.message || "Erro ao carregar provas.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Provas
          </Typography>
          <Typography color="text.secondary">
            Confira as provas disponíveis e seu histórico.
          </Typography>
        </Box>

        {erro && <Alert severity="error">{erro}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : (
          <>
            {/* Provas disponíveis */}
            <Box>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Disponíveis
              </Typography>

              {disponiveis.length === 0 ? (
                <Card>
                  <CardContent>
                    <Typography color="text.secondary">
                      Nenhuma prova disponível no momento.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={2}>
                  {disponiveis.map((prova) => {
                    const agora = new Date();
                    const dataInicio = new Date(prova.dataInicioDisponibilidade);
                    const bloqueada = dataInicio > agora;

                    return (
                      <Card key={prova.id} sx={bloqueada ? { opacity: 0.85 } : undefined}>
                        <CardContent>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="h6" fontWeight={700}>
                                {prova.titulo}
                              </Typography>
                              {prova.descricao && (
                                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                                  {prova.descricao}
                                </Typography>
                              )}
                            </Box>

                            <Stack direction="row" spacing={2} flexWrap="wrap">
                              <Chip label={`${prova.tempoDuracaoMinutos} min`} />
                              <Chip label={`Aprovação ${prova.percentualMinimoAprovacao}%`} />
                              {bloqueada ? (
                                <Chip label="Em breve" color="warning" />
                              ) : (
                                <Chip label="Disponível" color="success" />
                              )}
                            </Stack>

                            <Box>
                              {bloqueada ? (
                                <Typography variant="body2" color="text.secondary">
                                  Disponível a partir de{" "}
                                  <strong>
                                    {dataInicio.toLocaleDateString("pt-BR")} às{" "}
                                    {dataInicio.toLocaleTimeString("pt-BR", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </strong>
                                </Typography>
                              ) : (
                                <Button
                                  component={Link}
                                  href={`/painel/provas/${prova.id}`}
                                  variant="contained"
                                >
                                  Iniciar prova
                                </Button>
                              )}
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>

            <Divider />

            {/* Provas concluídas */}
            <Box>
              <Typography variant="h6" fontWeight={700} mb={2}>
                Realizadas
              </Typography>

              {concluidas.length === 0 ? (
                <Card>
                  <CardContent>
                    <Typography color="text.secondary">
                      Você ainda não realizou nenhuma prova.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Stack spacing={2}>
                  {concluidas.map((tentativa) => {
                    const aprovado = tentativa.aprovado;
                    const nota = tentativa.percentualAcerto ?? 0;

                    return (
                      <Card
                        key={tentativa.id}
                        variant="outlined"
                        sx={{
                          borderColor: aprovado ? "success.main" : "error.main",
                          borderWidth: 2,
                        }}
                      >
                        <CardContent>
                          <Stack spacing={2}>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              justifyContent="space-between"
                              alignItems={{ xs: "flex-start", sm: "center" }}
                              spacing={1}
                            >
                              <Box>
                                <Typography variant="h6" fontWeight={700}>
                                  {tentativa.prova.titulo}
                                </Typography>
                                {tentativa.prova.descricao && (
                                  <Typography
                                    color="text.secondary"
                                    variant="body2"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {tentativa.prova.descricao}
                                  </Typography>
                                )}
                              </Box>

                              <Stack direction="row" spacing={1} alignItems="center">
                                <Chip
                                  icon={aprovado ? <CheckCircleIcon /> : <CancelIcon />}
                                  label={aprovado ? "Aprovado" : "Reprovado"}
                                  color={aprovado ? "success" : "error"}
                                />
                                <Chip label={`${nota}%`} variant="outlined" />
                              </Stack>
                            </Stack>

                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={2}
                              alignItems={{ sm: "center" }}
                            >
                              {tentativa.dataFim && (
                                <Typography variant="body2" color="text.secondary">
                                  Realizada em{" "}
                                  {new Date(tentativa.dataFim).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </Typography>
                              )}

                              <Button
                                component={Link}
                                href={`/painel/provas/resultado/${tentativa.id}`}
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                              >
                                Ver gabarito
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
}
