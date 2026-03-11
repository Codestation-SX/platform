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
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";

type Aluno = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  ativo: boolean;
  createdAt: string;
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

export default function GerenciarTurmaPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [turma, setTurma] = useState<Turma | null>(null);
  const [pendentes, setPendentes] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [aba, setAba] = useState(0);
  const [processando, setProcessando] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setErro("");

      const [resTurma, resPendentes] = await Promise.all([
        fetch(`/api/backoffice/turmas/${id}`, { cache: "no-store" }),
        fetch("/api/backoffice/turmas/pendentes", { cache: "no-store" }),
      ]);

      const [dataTurma, dataPendentes] = await Promise.all([
        resTurma.json(),
        resPendentes.json(),
      ]);

      if (!resTurma.ok) throw new Error(dataTurma.error || "Erro ao carregar turma");
      setTurma(dataTurma);
      setPendentes(dataPendentes);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const vincularAluno = async (userId: string) => {
    setProcessando(userId);
    setSucesso("");
    setErro("");
    try {
      const res = await fetch(`/api/backoffice/turmas/${id}/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao vincular aluno");
      setSucesso("Aluno adicionado à turma com sucesso!");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setProcessando(null);
    }
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
      setSucesso("Turma encerrada.");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    }
  };

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
          {turma.status === "ATIVA" && (
            <Button variant="outlined" color="error" onClick={encerrarTurma}>
              Encerrar turma
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
                  ? `Pendentes — sem turma (${pendentes.length})`
                  : "Pendentes — sem turma"
              }
            />
          </Tabs>
          <Divider />

          {/* Aba 0: alunos da turma */}
          {aba === 0 && (
            <Box mt={2}>
              {turma.alunos.length === 0 ? (
                <Card>
                  <CardContent>
                    <Typography color="text.secondary">
                      Nenhum aluno nesta turma ainda. Use a aba <strong>Pendentes</strong> para adicionar alunos.
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

          {/* Aba 1: alunos pendentes */}
          {aba === 1 && (
            <Box mt={2}>
              {pendentes.length === 0 ? (
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
                    {pendentes.map((aluno, index) => (
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
                        {index < pendentes.length - 1 && <Divider component="li" />}
                      </Box>
                    ))}
                  </List>
                </Card>
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
