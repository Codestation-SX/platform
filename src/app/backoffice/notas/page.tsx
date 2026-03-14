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
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import GroupIcon from "@mui/icons-material/Group";
import PersonIcon from "@mui/icons-material/Person";

type Aluno = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  turma?: { id: string; nome: string } | null;
};

type Prova = {
  id: string;
  titulo: string;
  percentualMinimoAprovacao: number;
};

type Tentativa = {
  id: string;
  aluno: Aluno;
  prova: Prova;
  percentualAcerto: number;
  notaObtida: number;
  notaTotal: number;
  aprovado: boolean;
  status: string;
  dataFim: string | null;
};

type AlunoAgrupado = {
  aluno: Aluno;
  tentativas: Tentativa[];
};

type Turma = { id: string; nome: string };

export default function NotasPage() {
  const [tentativas, setTentativas] = useState<Tentativa[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [tabAtiva, setTabAtiva] = useState(0);

  useEffect(() => {
    fetch("/api/backoffice/turmas")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTurmas(data); })
      .catch(() => {});
  }, []);

  const carregarNotas = async (filtroAluno = "", filtroTurma = "") => {
    try {
      setLoading(true);
      setErro("");
      const params = new URLSearchParams();
      if (filtroAluno) params.set("aluno", filtroAluno);
      if (filtroTurma) params.set("turmaId", filtroTurma);
      const response = await fetch(`/api/backoffice/notas?${params.toString()}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error || "Erro ao carregar notas.");
      setTentativas(result);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar notas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarNotas(); }, []);

  useEffect(() => {
    if (tabAtiva !== 0) return;
    const timeout = setTimeout(() => carregarNotas(busca, ""), 400);
    return () => clearTimeout(timeout);
  }, [busca]);

  useEffect(() => {
    if (tabAtiva !== 1) return;
    carregarNotas("", turmaId);
  }, [turmaId]);

  const handleTabChange = (_: any, v: number) => {
    setTabAtiva(v);
    setBusca("");
    setTurmaId("");
    carregarNotas("", "");
  };

  const alunosAgrupados: AlunoAgrupado[] = tentativas.reduce<AlunoAgrupado[]>(
    (acc, tentativa) => {
      const existente = acc.find((a) => a.aluno.id === tentativa.aluno.id);
      if (existente) {
        existente.tentativas.push(tentativa);
      } else {
        acc.push({ aluno: tentativa.aluno, tentativas: [tentativa] });
      }
      return acc;
    },
    []
  );

  const mediaGeral =
    tentativas.length > 0
      ? Math.round(tentativas.reduce((acc, t) => acc + t.percentualAcerto, 0) / tentativas.length)
      : null;
  const totalAprovados = tentativas.filter((t) => t.aprovado).length;
  const totalReprovados = tentativas.filter((t) => !t.aprovado).length;

  const statusLabel: Record<string, string> = {
    CONCLUIDA: "Concluída",
    ENCERRADA_POR_TEMPO: "Tempo esgotado",
    REPROVADO_POR_FRAUDE: "Fraude",
  };

  const statusColor: Record<string, "default" | "success" | "error" | "warning"> = {
    CONCLUIDA: "success",
    ENCERRADA_POR_TEMPO: "warning",
    REPROVADO_POR_FRAUDE: "error",
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700}>Notas</Typography>
          <Typography color="text.secondary">Acompanhe o desempenho dos alunos nas provas.</Typography>
        </Box>

        {/* Cards de resumo */}
        {!loading && tentativas.length > 0 && (
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: "16px !important" }}>
                <Typography variant="body2" color="text.secondary">Total de tentativas</Typography>
                <Typography variant="h4" fontWeight={700}>{tentativas.length}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: "16px !important" }}>
                <Typography variant="body2" color="text.secondary">Média geral</Typography>
                <Typography variant="h4" fontWeight={700}>{mediaGeral}%</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: "16px !important" }}>
                <Typography variant="body2" color="text.secondary">Aprovados</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">{totalAprovados}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: "16px !important" }}>
                <Typography variant="body2" color="text.secondary">Reprovados</Typography>
                <Typography variant="h4" fontWeight={700} color="error.main">{totalReprovados}</Typography>
              </CardContent>
            </Card>
          </Stack>
        )}

        {/* Filtros */}
        <Card variant="outlined">
          <CardContent sx={{ p: "16px !important" }}>
            <Stack spacing={2}>
              <Tabs value={tabAtiva} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Por aluno" />
                <Tab icon={<GroupIcon fontSize="small" />} iconPosition="start" label="Por turma" />
              </Tabs>

              {tabAtiva === 0 && (
                <TextField
                  placeholder="Buscar por nome do aluno..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  size="small"
                  fullWidth
                  inputProps={{ autoComplete: "off" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}

              {tabAtiva === 1 && (
                <TextField
                  select
                  label="Selecione a turma"
                  value={turmaId}
                  onChange={(e) => setTurmaId(e.target.value)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="">Todas as turmas</MenuItem>
                  {turmas.map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>
                  ))}
                </TextField>
              )}
            </Stack>
          </CardContent>
        </Card>

        {erro && <Alert severity="error">{erro}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : alunosAgrupados.length === 0 ? (
          <Card variant="outlined">
            <CardContent sx={{ p: "16px !important" }}>
              <Typography variant="h6">Nenhum resultado encontrado</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {busca
                  ? `Nenhum aluno encontrado para "${busca}".`
                  : turmaId
                    ? "Nenhuma nota registrada para esta turma."
                    : "Ainda não há tentativas registradas."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {alunosAgrupados.map(({ aluno, tentativas: tents }) => {
              const mediaAluno =
                tents.length > 0
                  ? Math.round(tents.reduce((acc, t) => acc + t.percentualAcerto, 0) / tents.length)
                  : 0;
              const aprovadoGeral = tents.every((t) => t.aprovado);

              return (
                <Card key={aluno.id} variant="outlined">
                  <CardContent sx={{ p: "16px !important" }}>
                    <Stack spacing={2}>
                      {/* Cabeçalho do aluno */}
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Typography fontWeight={700} color="background.default" fontSize={16}>
                              {aluno.firstName[0].toUpperCase()}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography fontWeight={700}>
                              {aluno.firstName} {aluno.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {aluno.email}
                            </Typography>
                            {aluno.turma && (
                              <Chip
                                label={aluno.turma.nome}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                              />
                            )}
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" color="text.secondary">Média:</Typography>
                          <Chip
                            label={`${mediaAluno}%`}
                            size="small"
                            color={aprovadoGeral ? "success" : "error"}
                          />
                        </Stack>
                      </Stack>

                      <Divider />

                      {/* Tentativas do aluno */}
                      <Stack spacing={1}>
                        {tents.map((t) => (
                          <Stack
                            key={t.id}
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", md: "center" }}
                            spacing={1}
                            sx={{
                              px: 2,
                              py: 1.5,
                              borderRadius: 1.5,
                              bgcolor: "action.hover",
                              border: "1px solid",
                              borderColor: "divider",
                            }}
                          >
                            <Box flex={1}>
                              <Typography fontWeight={600} fontSize={14}>
                                {t.prova.titulo}
                              </Typography>
                              {t.dataFim && (
                                <Typography variant="body2" color="text.secondary">
                                  {new Date(t.dataFim).toLocaleDateString("pt-BR")}{" "}
                                  {new Date(t.dataFim).toLocaleTimeString("pt-BR", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Typography>
                              )}
                            </Box>

                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={statusLabel[t.status] ?? t.status}
                                size="small"
                                color={statusColor[t.status] ?? "default"}
                                variant="outlined"
                              />
                              <Chip
                                label={`${Math.round(t.percentualAcerto)}%`}
                                size="small"
                                color={t.aprovado ? "success" : "error"}
                              />
                              <Chip
                                label={t.aprovado ? "Aprovado" : "Reprovado"}
                                size="small"
                                color={t.aprovado ? "success" : "error"}
                              />
                            </Stack>
                          </Stack>
                        ))}
                      </Stack>
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
