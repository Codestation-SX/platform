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
  Stack,
  Typography,
} from "@mui/material";

type Prova = {
  id: string;
  titulo: string;
  descricao?: string | null;
  tempoDuracaoMinutos: number;
  percentualMinimoAprovacao: number;
  status: "RASCUNHO" | "ATIVA" | "INATIVA" | "ENCERRADA";
  dataInicioDisponibilidade: string;
  dataFimDisponibilidade: string;
};

export default function ProvasAlunoPage() {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const carregarProvas = async () => {
    try {
      setLoading(true);
      setErro("");

      const response = await fetch("/api/painel/provas", {
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

  useEffect(() => {
    carregarProvas();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Provas
          </Typography>
          <Typography color="text.secondary">
            Confira as provas disponíveis para realização.
          </Typography>
        </Box>

        {erro && <Alert severity="error">{erro}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : provas.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="h6">Nenhuma prova disponível</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                No momento não há provas ativas para você.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {provas.map((prova) => {
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
                              {dataInicio.toLocaleDateString("pt-BR")}{" "}
                              às {dataInicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
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
      </Stack>
    </Container>
  );
}