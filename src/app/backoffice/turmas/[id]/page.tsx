"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import SearchIcon from "@mui/icons-material/Search";

type Aluno = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ativo: boolean;
  createdAt: string;
  turmaId?: string | null;
  turma?: { id: string; nome: string } | null;
};

type Turma = {
  id: string;
  nome: string;
  descricao?: string | null;
  status: "ATIVA" | "ENCERRADA";
  dataInicio: string;
  dataFim?: string | null;
  alunos: Aluno[];
  _count: { lessons: number };
};

type Conflito = {
  userId: string;
  nomeAluno: string;
  turmaNome: string;
  message: string;
};

export default function GerenciarTurmaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [turma, setTurma] = useState<Turma | null>(null);
  const [pendentes, setPendentes] = useState<Aluno[]>([]);
  const [todosAlunos, setTodosAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aba, setAba] = useState(0);
  const [processando, setProcessando] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [buscaPendentes, setBuscaPendentes] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  // Dialog de confirmação de transferência
  const [conflito, setConflito] = useState<Conflito | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro("");

      const [resTurma, resPendentes, resTodos] = await Promise.all([
        fetch(`/api/backoffice/turmas/${id}`, { cache: "no-store" }),
        fetch("/api/backoffice/turmas/pendentes", { cache: "no-store" }),
        fetch("/api/backoffice/turmas/pendentes?todos=true", { cache: "no-store" }),
      ]);

      const [dataTurma, dataPendentes, dataTodos] = await Promise.all([
        resTurma.json(),
        resPendentes.json(),
        resTodos.json(),
      ]);

      if (!resTurma.ok) throw new Error(dataTurma.error || "Erro ao carregar turma");
      setTurma(dataTurma);
      setPendentes(dataPendentes);
      setTodosAlunos(dataTodos);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const vincularAluno = async (userId: string, force = false) => {
    setProcessando(userId);
    setSucesso("");
    setErro("");
    try {
      const res = await fetch(`/api/backoffice/turmas/${id}/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, force }),
      });
      const data = await res.json();

      if (res.status === 409 && data.conflito) {
        const aluno = todosAlunos.find((a) => a.id === userId);
        setConflito({
          userId,
          nomeAluno: aluno ? `${aluno.firstName} ${aluno.lastName}` : "Aluno",
          turmaNome: data.turmaNome,
          message: data.message,
        });
        return;
      }

      if (!res.ok) throw new Error(data.error || "Erro ao vincular aluno");
      setSucesso("Aluno adicionado à turma com sucesso!");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setProcessando(null);
    }
  };

  const confirmarTransferencia = async () => {
    if (!conflito) return;
    setConflito(null);
    await vincularAluno(conflito.userId, true);
  };

  const removerAluno = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este aluno da turma?")) return;
    setProcessando(userId);
    setSucesso("");
    setErro("");
    try {
      const res = await fetch(`/api/backoffice/turmas/${id}/alunos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao remover aluno");
      setSucesso("Aluno removido da turma.");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setProcessando(null);
    }
  };

  const toggleAtivo = async (userId: string, ativo: boolean) => {
    setToggling(userId);
    setSucesso("");
    setErro("");
    try {
      const res = await fetch(`/api/backoffice/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: !ativo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar status");
      setSucesso(`Aluno ${!ativo ? "ativado" : "inativado"} com sucesso!`);
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setToggling(null);
    }
  };

  const encerrarTurma = async () => {
    if (!confirm("Tem certeza que deseja encerrar esta turma? Os alunos perderão acesso às aulas.")) return;
    try {
      const res = await fetch(`/api/backoffice/turmas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENCERRADA" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao encerrar turma");
      setSucesso("Turma encerrada. Os alunos não têm mais acesso às aulas.");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    }
  };

  const reiniciarTurma = async () => {
    if (!confirm("Deseja reativar esta turma? Os alunos voltarão a ter acesso às aulas.")) return;
    try {
      const res = await fetch(`/api/backoffice/turmas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ATIVA" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao reativar turma");
      setSucesso("Turma reativada! Os alunos têm acesso às aulas novamente.");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    }
  };

  const pendentesFiltrados = pendentes.filter((a) => {
    const dt = new Date(a.createdAt);
    if (filtroDataInicio && dt < new Date(filtroDataInicio)) return false;
    if (filtroDataFim && dt > new Date(`${filtroDataFim}T23:59:59.999Z`)) return false;
    if (buscaPendentes.trim()) {
      const termo = buscaPendentes.toLowerCase();
      if (
        !a.firstName.toLowerCase().includes(termo) &&
        !a.lastName.toLowerCase().includes(termo) &&
        !a.email.toLowerCase().includes(termo)
      ) return false;
    }
    return true;
  });

  // Alunos filtrados pela busca (excluindo quem já está na turma)
  const alunosParaAdicionar = todosAlunos
    .filter((a) => a.turmaId !== id)
    .filter((a) => {
      if (!busca.trim()) return true;
      const termo = busca.toLowerCase();
      return (
        a.firstName.toLowerCase().includes(termo) ||
        a.lastName.toLowerCase().includes(termo) ||
        a.email.toLowerCase().includes(termo)
      );
    });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
      </Container>
    );
  }

  if (!turma) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">Turma não encontrada.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton onClick={() => router.push("/backoffice/turmas")}>
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h4" fontWeight={700}>{turma.nome}</Typography>
              <Chip
                label={turma.status}
                color={turma.status === "ATIVA" ? "success" : "default"}
              />
            </Stack>
            {turma.descricao && (
              <Typography color="text.secondary">{turma.descricao}</Typography>
            )}
          </Box>
          {turma.status === "ATIVA" ? (
            <Button variant="outlined" color="error" onClick={encerrarTurma}>
              Encerrar turma
            </Button>
          ) : (
            <Button variant="outlined" color="success" onClick={reiniciarTurma}>
              Reiniciar turma
            </Button>
          )}
        </Stack>

        {/* Resumo */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Box>
                <Typography variant="body2" color="text.secondary">Início</Typography>
                <Typography>{new Date(turma.dataInicio).toLocaleDateString("pt-BR")}</Typography>
              </Box>
              {turma.dataFim && (
                <Box>
                  <Typography variant="body2" color="text.secondary">Fim previsto</Typography>
                  <Typography>{new Date(turma.dataFim).toLocaleDateString("pt-BR")}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="body2" color="text.secondary">Alunos na turma</Typography>
                <Typography fontWeight={700}>{turma.alunos.length}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Aulas vinculadas</Typography>
                <Typography fontWeight={700}>{turma._count.lessons}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Aguardando turma</Typography>
                <Typography fontWeight={700} color={pendentes.length > 0 ? "warning.main" : "text.primary"}>
                  {pendentes.length}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {erro && <Alert severity="error" onClose={() => setErro("")}>{erro}</Alert>}
        {sucesso && <Alert severity="success" onClose={() => setSucesso("")}>{sucesso}</Alert>}

        {/* Abas */}
        <Box>
          <Tabs value={aba} onChange={(_, v) => setAba(v)}>
            <Tab label={`Alunos da turma (${turma.alunos.length})`} />
            <Tab
              label={
                pendentes.length > 0
                  ? `Sem turma (${pendentes.length})`
                  : "Sem turma"
              }
            />
            <Tab label="Adicionar aluno" />
          </Tabs>
          <Divider />

          {/* Aba 0: alunos da turma */}
          {aba === 0 && (
            <Box mt={2}>
              {turma.alunos.length === 0 ? (
                <Card>
                  <CardContent>
                    <Typography color="text.secondary">
                      Nenhum aluno nesta turma ainda. Use a aba <strong>Adicionar aluno</strong> para adicionar.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <List disablePadding>
                    {turma.alunos.map((aluno, index) => (
                      <Box key={aluno.id}>
                        <ListItem
                          secondaryAction={
                            turma.status === "ATIVA" ? (
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color={aluno.ativo ? "warning" : "success"}
                                  disabled={toggling === aluno.id}
                                  onClick={() => toggleAtivo(aluno.id, aluno.ativo)}
                                >
                                  {toggling === aluno.id
                                    ? "..."
                                    : aluno.ativo
                                    ? "Inativar"
                                    : "Ativar"}
                                </Button>
                                <IconButton
                                  edge="end"
                                  color="error"
                                  disabled={processando === aluno.id}
                                  onClick={() => removerAluno(aluno.id)}
                                  title="Remover da turma"
                                >
                                  {processando === aluno.id ? (
                                    <CircularProgress size={20} />
                                  ) : (
                                    <PersonRemoveIcon />
                                  )}
                                </IconButton>
                              </Stack>
                            ) : null
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>{aluno.firstName[0]}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${aluno.firstName} ${aluno.lastName}`}
                            secondary={aluno.email}
                          />
                        </ListItem>
                        {index < turma.alunos.length - 1 && <Divider component="li" />}
                      </Box>
                    ))}
                  </List>
                </Card>
              )}
            </Box>
          )}

          {/* Aba 1: alunos sem turma */}
          {aba === 1 && (
            <Box mt={2}>
              <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
                <TextField
                  placeholder="Buscar por nome ou e-mail..."
                  value={buscaPendentes}
                  onChange={(e) => setBuscaPendentes(e.target.value)}
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ minWidth: 240 }}
                />
                <TextField
                  label="Cadastro de"
                  type="date"
                  size="small"
                  value={filtroDataInicio}
                  onChange={(e) => setFiltroDataInicio(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <TextField
                  label="Cadastro até"
                  type="date"
                  size="small"
                  value={filtroDataFim}
                  onChange={(e) => setFiltroDataFim(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                {(filtroDataInicio || filtroDataFim || buscaPendentes) && (
                  <Button size="small" onClick={() => { setFiltroDataInicio(""); setFiltroDataFim(""); setBuscaPendentes(""); }}>
                    Limpar
                  </Button>
                )}
              </Stack>
              {pendentesFiltrados.length === 0 ? (
                <Card>
                  <CardContent>
                    <Typography color="text.secondary">
                      Nenhum aluno aguardando atribuição de turma.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <List disablePadding>
                    {pendentesFiltrados.map((aluno, index) => (
                      <Box key={aluno.id}>
                        <ListItem
                          secondaryAction={
                            turma.status === "ATIVA" ? (
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={
                                  processando === aluno.id ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    <PersonAddIcon />
                                  )
                                }
                                disabled={processando === aluno.id}
                                onClick={() => vincularAluno(aluno.id)}
                              >
                                Adicionar
                              </Button>
                            ) : null
                          }
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: "warning.light" }}>
                              {aluno.firstName[0]}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={`${aluno.firstName} ${aluno.lastName}`}
                            secondary={
                              <>
                                {aluno.email}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ display: "block" }}
                                >
                                  Cadastrado em{" "}
                                  {new Date(aluno.createdAt).toLocaleDateString("pt-BR")}
                                </Typography>
                              </>
                            }
                          />
                        </ListItem>
                        {index < pendentesFiltrados.length - 1 && <Divider component="li" />}
                      </Box>
                    ))}
                  </List>
                </Card>
              )}
            </Box>
          )}

          {/* Aba 2: adicionar qualquer aluno */}
          {aba === 2 && (
            <Box mt={2}>
              <Stack spacing={2}>
                <TextField
                  placeholder="Buscar por nome ou e-mail..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {alunosParaAdicionar.length === 0 ? (
                  <Card>
                    <CardContent>
                      <Typography color="text.secondary">
                        {busca.trim()
                          ? "Nenhum aluno encontrado para esta busca."
                          : "Todos os alunos já estão nesta turma."}
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <List disablePadding>
                      {alunosParaAdicionar.map((aluno, index) => (
                        <Box key={aluno.id}>
                          <ListItem
                            secondaryAction={
                              turma.status === "ATIVA" ? (
                                <Button
                                  variant="contained"
                                  size="small"
                                  startIcon={
                                    processando === aluno.id ? (
                                      <CircularProgress size={16} color="inherit" />
                                    ) : (
                                      <PersonAddIcon />
                                    )
                                  }
                                  disabled={processando === aluno.id}
                                  onClick={() => vincularAluno(aluno.id)}
                                >
                                  Adicionar
                                </Button>
                              ) : null
                            }
                          >
                            <ListItemAvatar>
                              <Avatar>{aluno.firstName[0]}</Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={`${aluno.firstName} ${aluno.lastName}`}
                              secondary={
                                <>
                                  {aluno.email}
                                  {aluno.turma && (
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      color="warning.main"
                                      sx={{ display: "block" }}
                                    >
                                      Turma atual: {aluno.turma.nome}
                                    </Typography>
                                  )}
                                </>
                              }
                            />
                          </ListItem>
                          {index < alunosParaAdicionar.length - 1 && <Divider component="li" />}
                        </Box>
                      ))}
                    </List>
                  </Card>
                )}
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>

      {/* Dialog de confirmação de transferência */}
      <Dialog open={!!conflito} onClose={() => setConflito(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Transferir aluno de turma</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {conflito?.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConflito(null)}>Cancelar</Button>
          <Button onClick={confirmarTransferencia} variant="contained" color="warning">
            Transferir mesmo assim
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
