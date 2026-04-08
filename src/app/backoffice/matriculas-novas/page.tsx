"use client";

import { useEffect, useState } from "react";
import {
  Alert,
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
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

type Aluno = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};

type Turma = {
  id: string;
  nome: string;
  status: string;
};

export default function MatriculasNovasPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  // Dialog de atribuição
  const [dialogAberto, setDialogAberto] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [turmaEscolhida, setTurmaEscolhida] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroDialog, setErroDialog] = useState("");

  const carregarAlunos = async () => {
    try {
      setLoading(true);
      setErro("");
      const res = await fetch("/api/backoffice/turmas/pendentes");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao carregar matrículas.");
      setAlunos(data);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAlunos();
    fetch("/api/backoffice/turmas")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTurmas(data.filter((t: Turma) => t.status === "ATIVA"));
        }
      })
      .catch(() => {});
  }, []);

  const abrirDialog = (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    setTurmaEscolhida("");
    setErroDialog("");
    setDialogAberto(true);
  };

  const fecharDialog = () => {
    setDialogAberto(false);
    setAlunoSelecionado(null);
  };

  const atribuirTurma = async () => {
    if (!alunoSelecionado || !turmaEscolhida) return;
    setSalvando(true);
    setErroDialog("");
    try {
      const res = await fetch(`/api/backoffice/turmas/${turmaEscolhida}/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: alunoSelecionado.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao atribuir turma.");
      // Remove aluno da lista
      setAlunos((prev) => prev.filter((a) => a.id !== alunoSelecionado.id));
      fecharDialog();
    } catch (e: any) {
      setErroDialog(e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Matrículas Novas
          </Typography>
          <Typography color="text.secondary">
            Alunos cadastrados que ainda não foram atribuídos a uma turma.
          </Typography>
        </Box>

        {/* Badge de contagem */}
        {!loading && (
          <Box>
            <Chip
              label={
                alunos.length === 0
                  ? "Nenhuma matrícula pendente"
                  : `${alunos.length} aluno${alunos.length !== 1 ? "s" : ""} aguardando turma`
              }
              color={alunos.length === 0 ? "success" : "warning"}
              icon={alunos.length === 0 ? <CheckCircleIcon /> : undefined}
            />
          </Box>
        )}

        {erro && <Alert severity="error">{erro}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : alunos.length === 0 ? (
          <Card variant="outlined">
            <CardContent>
              <Stack alignItems="center" spacing={1} py={3}>
                <CheckCircleIcon sx={{ fontSize: 48, color: "success.main" }} />
                <Typography variant="h6" fontWeight={700}>
                  Tudo em dia!
                </Typography>
                <Typography color="text.secondary">
                  Todos os alunos já estão atribuídos a uma turma.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {alunos.map((aluno) => (
              <Card key={aluno.id} variant="outlined">
                <CardContent sx={{ p: "16px !important" }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={2}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
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
                        <Typography variant="caption" color="text.secondary">
                          Cadastrado em{" "}
                          {new Date(aluno.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </Typography>
                      </Box>
                    </Stack>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PersonAddIcon />}
                      onClick={() => abrirDialog(aluno)}
                      sx={{ flexShrink: 0 }}
                    >
                      Atribuir turma
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>

      {/* Dialog de atribuição */}
      <Dialog open={dialogAberto} onClose={fecharDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Atribuir turma</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            {alunoSelecionado && (
              <Typography variant="body2" color="text.secondary">
                Aluno:{" "}
                <strong>
                  {alunoSelecionado.firstName} {alunoSelecionado.lastName}
                </strong>
              </Typography>
            )}

            <TextField
              select
              label="Selecione a turma"
              value={turmaEscolhida}
              onChange={(e) => setTurmaEscolhida(e.target.value)}
              size="small"
              fullWidth
            >
              {turmas.length === 0 ? (
                <MenuItem disabled value="">
                  Nenhuma turma ativa disponível
                </MenuItem>
              ) : (
                turmas.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.nome}
                  </MenuItem>
                ))
              )}
            </TextField>

            {erroDialog && <Alert severity="error">{erroDialog}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialog} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={atribuirTurma}
            disabled={!turmaEscolhida || salvando}
          >
            {salvando ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
