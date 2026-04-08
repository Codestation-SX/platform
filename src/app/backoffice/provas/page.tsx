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
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

type Alternativa = {
  id: string;
  texto: string;
  correta: boolean;
};

type Pergunta = {
  id: string;
  enunciado: string;
  valorNota: number;
  ordem: number;
  alternativas: Alternativa[];
};

type Prova = {
  id: string;
  titulo: string;
  descricao?: string | null;
  dataInicioDisponibilidade: string;
  dataFimDisponibilidade: string;
  tempoDuracaoMinutos: number;
  percentualMinimoAprovacao: number;
  status: "RASCUNHO" | "ATIVA" | "INATIVA" | "ENCERRADA";
  perguntas: Pergunta[];
  createdAt: string;
};

function getStatusColor(status: Prova["status"]) {
  switch (status) {
    case "ATIVA":
      return "success";
    case "RASCUNHO":
      return "default";
    case "INATIVA":
      return "warning";
    case "ENCERRADA":
      return "error";
    default:
      return "default";
  }
}

export default function ProvasPage() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [provaSelecionada, setProvaSelecionada] = useState<Prova | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const carregarProvas = async () => {
    try {
      setLoading(true);
      setErro("");

      const response = await fetch("/api/backoffice/provas", {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao carregar provas.");
      }

      setProvas(result);
    } catch (error: any) {
      setErro(error.message || "Erro ao carregar provas.");
    } finally {
      setLoading(false);
    }
  };

  const excluirProva = async () => {
    if (!provaSelecionada) return;

    try {
      setExcluindo(true);
      setErro("");
      setSucesso("");

      const response = await fetch(
        `/api/backoffice/provas/${provaSelecionada.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao excluir prova.");
      }

      setSucesso("Prova excluída com sucesso.");
      setProvaSelecionada(null);
      await carregarProvas();
    } catch (error: any) {
      setErro(error.message || "Erro ao excluir prova.");
    } finally {
      setExcluindo(false);
    }
  };

  useEffect(() => {
    carregarProvas();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Provas
            </Typography>
            <Typography color="text.secondary">
              Gerencie as provas cadastradas.
            </Typography>
          </Box>

          <Button
            component={Link}
            href="/backoffice/provas/nova"
            variant="contained"
            startIcon={<AddIcon />}
          >
            Nova prova
          </Button>
        </Stack>

        {erro && <Alert severity="error">{erro}</Alert>}
        {sucesso && <Alert severity="success">{sucesso}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : provas.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6">Nenhuma prova cadastrada</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Clique em <strong>Nova prova</strong> para criar a primeira.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {provas.map((prova) => (
              <Card key={prova.id}>
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      spacing={2}
                    >
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

                      <Chip
                        label={prova.status}
                        color={getStatusColor(prova.status)}
                      />
                    </Stack>

                    <Divider />

                    <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Início
                        </Typography>
                        <Typography>
                          {new Date(prova.dataInicioDisponibilidade).toLocaleString(
                            "pt-BR"
                          )}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Fim
                        </Typography>
                        <Typography>
                          {new Date(prova.dataFimDisponibilidade).toLocaleString(
                            "pt-BR"
                          )}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Duração
                        </Typography>
                        <Typography>{prova.tempoDuracaoMinutos} min</Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Aprovação
                        </Typography>
                        <Typography>{prova.percentualMinimoAprovacao}%</Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Perguntas
                        </Typography>
                        <Typography>{prova.perguntas?.length ?? 0}</Typography>
                      </Box>
                    </Stack>

                    <Divider />

                    <Stack direction="row" spacing={2}>
                      <Button
                        component={Link}
                        href={`/backoffice/provas/${prova.id}`}
                        variant="outlined"
                        startIcon={<EditIcon />}
                      >
                        Editar
                      </Button>

                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setProvaSelecionada(prova)}
                      >
                        Excluir
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}

        <Dialog
          open={!!provaSelecionada}
          onClose={() => !excluindo && setProvaSelecionada(null)}
        >
          <DialogTitle>Excluir prova</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tem certeza que deseja excluir a prova{" "}
              <strong>{provaSelecionada?.titulo}</strong>?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setProvaSelecionada(null)}
              disabled={excluindo}
            >
              Cancelar
            </Button>
            <Button
              onClick={excluirProva}
              color="error"
              variant="contained"
              disabled={excluindo}
            >
              {excluindo ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
}