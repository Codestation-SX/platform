"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  Chip,
  Divider,
  FormControlLabel,
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
import PrintIcon from "@mui/icons-material/Print";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { gerarCertificadoPDF } from "@/utils/gerarCertificadoPDF";
import { useToast } from "@/components/hooks/useToast";

type Turma = { id: string; nome: string };
type Aluno = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cpf?: string;
  birthDate?: string;
  address?: { city?: string; state?: string };
  certificadoEmitido?: boolean;
  certificadoEm?: string;
  certificadoId?: string;
};

export default function CertificadosBackofficePage() {
  const { success, error: toastError } = useToast();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmaId, setTurmaId] = useState("");
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [emitindo, setEmitindo] = useState(false);
  const [erro, setErro] = useState("");

  // Carregar turmas
  useEffect(() => {
    fetch("/api/backoffice/turmas")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTurmas(data); })
      .catch(() => {});
  }, []);

  // Carregar alunos da turma selecionada + certificados já emitidos
  useEffect(() => {
    if (!turmaId) {
      setAlunos([]);
      setSelecionados(new Set());
      setTurmaSelecionada(null);
      return;
    }

    const turma = turmas.find((t) => t.id === turmaId) || null;
    setTurmaSelecionada(turma);

    const carregar = async () => {
      setLoadingAlunos(true);
      setErro("");
      try {
        const [alunosRes, certsRes] = await Promise.all([
          fetch(`/api/backoffice/turmas/${turmaId}/alunos`),
          fetch(`/api/backoffice/certificados?turmaId=${turmaId}`),
        ]);
        const alunosData = await alunosRes.json();
        const certsData = await certsRes.json();

        const certsMap = new Map<string, string>(
          Array.isArray(certsData)
            ? certsData.map((c: any) => [c.alunoId, c.emitidoEm])
            : []
        );

        const certsIdMap = new Map<string, string>(
          Array.isArray(certsData)
            ? certsData.map((c: any) => [c.alunoId, c.id])
            : []
        );

        const lista: Aluno[] = Array.isArray(alunosData)
          ? alunosData.map((a: any) => ({
              id: a.id,
              firstName: a.firstName,
              lastName: a.lastName,
              email: a.email,
              cpf: a.cpf,
              birthDate: a.birthDate,
              address: a.address,
              certificadoEmitido: certsMap.has(a.id),
              certificadoEm: certsMap.get(a.id),
              certificadoId: certsIdMap.get(a.id),
            }))
          : [];

        setAlunos(lista);
        setSelecionados(new Set());
      } catch {
        setErro("Erro ao carregar alunos da turma.");
      } finally {
        setLoadingAlunos(false);
      }
    };

    carregar();
  }, [turmaId, turmas]);

  const toggleAluno = (id: string) => {
    setSelecionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    if (selecionados.size === alunos.length) {
      setSelecionados(new Set());
    } else {
      setSelecionados(new Set(alunos.map((a) => a.id)));
    }
  };

  const emitirSelecionados = async () => {
    if (selecionados.size === 0 || !turmaId) return;
    setEmitindo(true);
    try {
      const res = await fetch("/api/backoffice/certificados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turmaId, alunoIds: Array.from(selecionados) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao emitir certificados.");

      success(`${data.certificados.length} certificado(s) emitido(s) com sucesso!`);

      // Atualiza flags localmente
      const agora = new Date().toISOString();
      setAlunos((prev) =>
        prev.map((a) =>
          selecionados.has(a.id)
            ? { ...a, certificadoEmitido: true, certificadoEm: agora }
            : a
        )
      );
      setSelecionados(new Set());
    } catch (err: any) {
      toastError(err.message || "Erro ao emitir certificados.");
    } finally {
      setEmitindo(false);
    }
  };

  const imprimirCertificado = (aluno: Aluno) => {
    if (!turmaSelecionada) return;
    gerarCertificadoPDF({
      nomeAluno: `${aluno.firstName} ${aluno.lastName}`,
      cpf: aluno.cpf,
      email: aluno.email,
      dataNascimento: aluno.birthDate,
      cidade: aluno.address?.city,
      estado: aluno.address?.state,
      nomeTurma: turmaSelecionada.nome,
      emitidoEm: aluno.certificadoEm || new Date().toISOString(),
      certificadoId: aluno.certificadoId,
    });
  };

  const todosSelecionados = alunos.length > 0 && selecionados.size === alunos.length;
  const algunsSelecionados = selecionados.size > 0 && !todosSelecionados;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <WorkspacePremiumIcon color="primary" />
            <Typography variant="h4" fontWeight={700}>Certificados</Typography>
          </Stack>
          <Typography color="text.secondary">
            Selecione uma turma para emitir certificados para os alunos.
          </Typography>
        </Box>

        {/* Seletor de turma */}
        <Card variant="outlined">
          <CardContent sx={{ p: "16px !important" }}>
            <TextField
              select
              label="Selecione a turma"
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">— Selecione uma turma —</MenuItem>
              {turmas.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.nome}</MenuItem>
              ))}
            </TextField>
          </CardContent>
        </Card>

        {erro && <Alert severity="error">{erro}</Alert>}

        {/* Lista de alunos */}
        {turmaId && (
          loadingAlunos ? (
            <Stack alignItems="center" py={6}>
              <CircularProgress />
            </Stack>
          ) : alunos.length === 0 ? (
            <Card variant="outlined">
              <CardContent sx={{ p: "24px !important" }}>
                <Typography>Nenhum aluno encontrado nesta turma.</Typography>
              </CardContent>
            </Card>
          ) : (
            <Card variant="outlined">
              <CardContent sx={{ p: "16px !important" }}>
                {/* Barra de ações */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={2}
                  mb={2}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={todosSelecionados}
                        indeterminate={algunsSelecionados}
                        onChange={toggleTodos}
                      />
                    }
                    label={
                      <Typography fontWeight={600}>
                        Selecionar todos ({alunos.length})
                      </Typography>
                    }
                  />
                  <Button
                    variant="contained"
                    startIcon={<WorkspacePremiumIcon />}
                    disabled={selecionados.size === 0 || emitindo}
                    onClick={emitirSelecionados}
                  >
                    {emitindo
                      ? "Emitindo..."
                      : `Emitir para ${selecionados.size} selecionado(s)`}
                  </Button>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox" />
                        <TableCell sx={{ fontWeight: 700 }}>Aluno</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>E-mail</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Certificado</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">Ações</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alunos.map((aluno) => (
                        <TableRow key={aluno.id} hover selected={selecionados.has(aluno.id)}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selecionados.has(aluno.id)}
                              onChange={() => toggleAluno(aluno.id)}
                            />
                          </TableCell>
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
                            {aluno.certificadoEmitido ? (
                              <Chip
                                label={`Emitido em ${new Date(aluno.certificadoEm!).toLocaleDateString("pt-BR")}`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            ) : (
                              <Chip label="Não emitido" size="small" color="default" variant="outlined" />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<PrintIcon />}
                              disabled={!aluno.certificadoEmitido}
                              onClick={() => imprimirCertificado(aluno)}
                            >
                              Imprimir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )
        )}
      </Stack>
    </Container>
  );
}
