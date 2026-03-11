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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";

type Turma = {
  id: string;
  nome: string;
  descricao?: string | null;
  status: "ATIVA" | "ENCERRADA";
  dataInicio: string;
  dataFim?: string | null;
  createdAt: string;
  _count: { alunos: number; lessons: number };
};

export default function TurmasPage() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  // Modal criar turma
  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [erroModal, setErroModal] = useState("");

  const carregar = async () => {
    try {
      setLoading(true);
      setErro("");
      const res = await fetch("/api/backoffice/turmas", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao carregar turmas");
      setTurmas(data);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const abrirModal = () => {
    setNome("");
    setDescricao("");
    setDataInicio(null);
    setDataFim(null);
    setErroModal("");
    setModalAberto(true);
  };

  const criarTurma = async () => {
    if (!nome.trim()) { setErroModal("Nome é obrigatório"); return; }
    if (!dataInicio) { setErroModal("Data de início é obrigatória"); return; }

    setSalvando(true);
    setErroModal("");
    try {
      const res = await fetch("/api/backoffice/turmas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          descricao: descricao || undefined,
          dataInicio: dataInicio.toISOString(),
          dataFim: dataFim?.toISOString() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao criar turma");
      setSucesso("Turma criada com sucesso!");
      setModalAberto(false);
      await carregar();
    } catch (e: any) {
      setErroModal(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const encerrarTurma = async (id: string) => {
    if (!confirm("Tem certeza que deseja encerrar esta turma?")) return;
    try {
      const res = await fetch(`/api/backoffice/turmas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ENCERRADA" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao encerrar turma");
      setSucesso("Turma encerrada com sucesso!");
      await carregar();
    } catch (e: any) {
      setErro(e.message);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700}>Turmas</Typography>
              <Typography color="text.secondary">Gerencie as turmas e vincule alunos.</Typography>
            </Box>
            <Button variant="contained" startIcon={<AddIcon />} onClick={abrirModal}>
              Nova turma
            </Button>
          </Stack>

          {erro && <Alert severity="error" onClose={() => setErro("")}>{erro}</Alert>}
          {sucesso && <Alert severity="success" onClose={() => setSucesso("")}>{sucesso}</Alert>}

          {loading ? (
            <Stack alignItems="center" py={6}><CircularProgress /></Stack>
          ) : turmas.length === 0 ? (
            <Card>
              <CardContent>
                <Stack alignItems="center" spacing={1} py={3}>
                  <GroupsIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                  <Typography variant="h6">Nenhuma turma cadastrada</Typography>
                  <Typography color="text.secondary">
                    Clique em <strong>Nova turma</strong> para começar.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={2}>
              {turmas.map((turma) => (
                <Card key={turma.id}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                        spacing={2}
                      >
                        <Box>
                          <Typography variant="h6" fontWeight={700}>{turma.nome}</Typography>
                          {turma.descricao && (
                            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                              {turma.descricao}
                            </Typography>
                          )}
                        </Box>
                        <Chip
                          label={turma.status}
                          color={turma.status === "ATIVA" ? "success" : "default"}
                        />
                      </Stack>

                      <Divider />

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
                          <Typography variant="body2" color="text.secondary">Alunos</Typography>
                          <Typography>{turma._count.alunos}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">Aulas</Typography>
                          <Typography>{turma._count.lessons}</Typography>
                        </Box>
                      </Stack>

                      <Divider />

                      <Stack direction="row" spacing={2}>
                        <Button
                          component={Link}
                          href={`/backoffice/turmas/${turma.id}`}
                          variant="outlined"
                        >
                          Gerenciar
                        </Button>
                        {turma.status === "ATIVA" && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => encerrarTurma(turma.id)}
                          >
                            Encerrar turma
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>

        {/* Modal: Nova Turma */}
        <Dialog open={modalAberto} onClose={() => !salvando && setModalAberto(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Nova turma</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              {erroModal && <Alert severity="error">{erroModal}</Alert>}
              <TextField
                label="Nome da turma"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Descrição (opcional)"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                fullWidth
                multiline
                rows={2}
              />
              <DatePicker
                label="Data de início"
                value={dataInicio}
                onChange={(v) => setDataInicio(v)}
                slotProps={{ textField: { fullWidth: true, required: true } }}
              />
              <DatePicker
                label="Data de fim prevista (opcional)"
                value={dataFim}
                onChange={(v) => setDataFim(v)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalAberto(false)} disabled={salvando}>
              Cancelar
            </Button>
            <Button onClick={criarTurma} variant="contained" disabled={salvando}>
              {salvando ? "Criando..." : "Criar turma"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}
