"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
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
import GppBadIcon from "@mui/icons-material/GppBad";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PercentIcon from "@mui/icons-material/Percent";

type Prova = {
  id: string;
  titulo: string;
  percentualMinimoAprovacao: number;
};

type Tentativa = {
  id: string;
  prova: Prova;
  percentualAcerto: number;
  notaObtida: number;
  notaTotal: number;
  aprovado: boolean;
  status: string;
  fraudeDetectada: boolean;
  motivoFraude: string | null;
  dataFim: string | null;
  dataInicio: string;
};

const statusConfig: Record<
  string,
  { label: string; color: "default" | "success" | "error" | "warning" }
> = {
  CONCLUIDA: { label: "Concluída", color: "success" },
  ENCERRADA_POR_TEMPO: { label: "Tempo esgotado", color: "warning" },
  REPROVADO_POR_FRAUDE: { label: "Fraude detectada", color: "error" },
};

export default function MinhasNotasPage() {
  const [tentativas, setTentativas] = useState<Tentativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        setErro("");

        const response = await fetch("/api/painel/notas", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Erro ao carregar notas.");
        }

        setTentativas(result);
      } catch (error: any) {
        setErro(error.message || "Erro ao carregar notas.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  const totalProvas = tentativas.length;
  const totalAprovadas = tentativas.filter((t) => t.aprovado).length;
  const totalReprovadas = tentativas.filter((t) => !t.aprovado).length;
  const mediaGeral =
    totalProvas > 0
      ? Math.round(
          tentativas.reduce((acc, t) => acc + t.percentualAcerto, 0) / totalProvas
        )
      : null;

  const formatarData = (data: string) => {
    if (!mounted) return "";
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Minhas notas
          </Typography>
          <Typography color="text.secondary">
            Acompanhe seu desempenho nas provas realizadas.
          </Typography>
        </Box>

        {/* Resumo */}
        {!loading && totalProvas > 0 && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <AssignmentIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Provas realizadas
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {totalProvas}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ flex: 1, borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <PercentIcon color="primary" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Média geral
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {mediaGeral}%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{ flex: 1, borderRadius: 2, borderColor: "success.light" }}
            >
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <EmojiEventsIcon color="success" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Aprovações
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {totalAprovadas}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card
              variant="outlined"
              sx={{ flex: 1, borderRadius: 2, borderColor: "error.light" }}
            >
              <CardContent>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <CancelIcon color="error" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Reprovações
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="error.main">
                      {totalReprovadas}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        )}

        {erro && <Alert severity="error">{erro}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : totalProvas === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack spacing={1} alignItems="center" py={4} textAlign="center">
                <AssignmentIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                <Typography variant="h6">Nenhuma prova realizada</Typography>
                <Typography color="text.secondary">
                  Suas notas aparecerão aqui após realizar uma prova.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {tentativas.map((t) => {
              const statusInfo = statusConfig[t.status] ?? {
                label: t.status,
                color: "default" as const,
              };
              const isFraude = t.status === "REPROVADO_POR_FRAUDE";

              return (
                <Card
                  key={t.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderColor: isFraude
                      ? "error.main"
                      : t.aprovado
                      ? "success.light"
                      : "warning.light",
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      {/* Título e status */}
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={1}
                      >
                        <Box>
                          <Typography fontWeight={700} fontSize={16}>
                            {t.prova.titulo}
                          </Typography>
                          {t.dataFim && (
                            <Typography variant="body2" color="text.secondary">
                              Realizada em {formatarData(t.dataFim)}
                            </Typography>
                          )}
                        </Box>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={statusInfo.label}
                            color={statusInfo.color}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`${Math.round(t.percentualAcerto)}%`}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              minWidth: 60,
                              bgcolor: t.aprovado ? "success.light" : "error.light",
                              color: t.aprovado ? "success.dark" : "error.dark",
                            }}
                          />
                          <Chip
                            icon={
                              t.aprovado ? (
                                <CheckCircleIcon fontSize="small" />
                              ) : (
                                <CancelIcon fontSize="small" />
                              )
                            }
                            label={t.aprovado ? "Aprovado" : "Reprovado"}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              bgcolor: t.aprovado ? "success.main" : "error.main",
                              color: "white",
                              "& .MuiChip-icon": { color: "white" },
                            }}
                          />
                        </Stack>
                      </Stack>

                      <Divider />

                      {/* Detalhes */}
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Nota obtida
                          </Typography>
                          <Typography fontWeight={700}>
                            {t.notaObtida} / {t.notaTotal}
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Mínimo para aprovação
                          </Typography>
                          <Typography fontWeight={700}>
                            {t.prova.percentualMinimoAprovacao}%
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Sua nota
                          </Typography>
                          <Typography
                            fontWeight={700}
                            color={t.aprovado ? "success.main" : "error.main"}
                          >
                            {Math.round(t.percentualAcerto)}%
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Motivo da fraude */}
                      {isFraude && t.motivoFraude && (
                        <>
                          <Divider />
                          <Alert
                            severity="error"
                            icon={<GppBadIcon />}
                            sx={{ borderRadius: 1.5 }}
                          >
                            <Typography fontWeight={700} fontSize={13}>
                              Motivo da desclassificação
                            </Typography>
                            <Typography fontSize={13}>{t.motivoFraude}</Typography>
                          </Alert>
                        </>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}