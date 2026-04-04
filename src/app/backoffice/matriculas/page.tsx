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
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";

type Turma = { id: string; nome: string };

type AlunoMatriculado = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  createdAt: string;
  ativo: boolean;
  turma: Turma | null;
};

export default function MatriculasPage() {
  const [alunos, setAlunos] = useState<AlunoMatriculado[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [nome, setNome] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    fetch("/api/backoffice/turmas")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTurmas(data); })
      .catch(() => {});
  }, []);

  const carregar = async (filtros: {
    nome?: string;
    turmaId?: string;
    dataInicio?: string;
    dataFim?: string;
  } = {}) => {
    try {
      setLoading(true);
      setErro("");
      const params = new URLSearchParams();
      if (filtros.nome) params.set("nome", filtros.nome);
      if (filtros.turmaId) params.set("turmaId", filtros.turmaId);
      if (filtros.dataInicio) params.set("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.set("dataFim", filtros.dataFim);
      const res = await fetch(`/api/backoffice/matriculas?${params.toString()}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao carregar matrículas.");
      setAlunos(data);
    } catch (err: any) {
      setErro(err.message || "Erro ao carregar matrículas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  // Debounce no campo nome
  useEffect(() => {
    const t = setTimeout(() => carregar({ nome, turmaId, dataInicio, dataFim }), 400);
    return () => clearTimeout(t);
  }, [nome]);

  // Filtros imediatos
  useEffect(() => {
    carregar({ nome, turmaId, dataInicio, dataFim });
  }, [turmaId, dataInicio, dataFim]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <SchoolIcon color="primary" />
            <Typography variant="h4" fontWeight={700}>Matrículas Admin</Typography>
          </Stack>
          <Typography color="text.secondary">
            Alunos matriculados diretamente pelo backoffice, sem fluxo de pagamento.
          </Typography>
        </Box>

        {/* Cards resumo */}
        {!loading && (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: "16px !important" }}>
                <Typography variant="body2" color="text.secondary">Total matriculados</Typography>
                <Typography variant="h4" fontWeight={700}>{alunos.length}</Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: "16px !important" }}>
                <Typography variant="body2" color="text.secondary">Ativos</Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {alunos.filter((a) => a.ativo).length}
                </Typography>
              </CardContent>
            </Card>
            <Card variant="outlined" sx={{ flex: 1 }}>
              <CardContent sx={{ p: "16px !important" }}>
                <Typography variant="body2" color="text.secondary">Inativos</Typography>
                <Typography variant="h4" fontWeight={700} color="error.main">
                  {alunos.filter((a) => !a.ativo).length}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        )}

        {/* Filtros */}
        <Card variant="outlined">
          <CardContent sx={{ p: "16px !important" }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                placeholder="Buscar por nome ou e-mail..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                size="small"
                sx={{ flex: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                label="Turma"
                value={turmaId}
                onChange={(e) => setTurmaId(e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 160 }}
              >
                <MenuItem value="">Todas as turmas</MenuItem>
                {turmas.map((t) => (
                  <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Data início"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Data fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                size="small"
                sx={{ flex: 1 }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </CardContent>
        </Card>

        {erro && <Alert severity="error">{erro}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : alunos.length === 0 ? (
          <Card variant="outlined">
            <CardContent sx={{ p: "24px !important" }}>
              <Typography variant="h6">Nenhum aluno encontrado</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {nome || turmaId || dataInicio || dataFim
                  ? "Nenhum aluno corresponde aos filtros aplicados."
                  : "Ainda não há alunos matriculados pelo backoffice."}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>E-mail</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CPF</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Turma</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Data de matrícula</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {alunos.map((aluno) => (
                  <TableRow key={aluno.id} hover>
                    <TableCell>
                      <Typography fontWeight={600} fontSize={14}>
                        {aluno.firstName} {aluno.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {aluno.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {aluno.cpf}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {aluno.turma ? (
                        <Chip
                          label={aluno.turma.nome}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(aluno.createdAt).toLocaleDateString("pt-BR")}{" "}
                        <Typography component="span" variant="body2" color="text.secondary">
                          {new Date(aluno.createdAt).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={aluno.ativo ? "Ativo" : "Inativo"}
                        size="small"
                        color={aluno.ativo ? "success" : "default"}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Container>
  );
}
