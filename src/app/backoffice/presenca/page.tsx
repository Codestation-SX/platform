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
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

type Aluno = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  lastLoginAt: string | null;
  turma: { id: string; nome: string } | null;
};

const FILTROS = [
  { value: "online", label: "Online agora", color: "success" as const },
  { value: "tres_dias", label: "Sem logar há 3+ dias", color: "warning" as const },
  { value: "semana", label: "Sem logar há 1+ semana", color: "error" as const },
];

function formatarUltimoAcesso(data: string | null): string {
  if (!data) return "Nunca acessou";
  const diff = Date.now() - new Date(data).getTime();
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (minutos < 60) return `${minutos} min atrás`;
  if (horas < 24) return `${horas}h atrás`;
  return `${dias} dia${dias > 1 ? "s" : ""} atrás`;
}

export default function PresencaPage() {
  const [filtro, setFiltro] = useState("tres_dias");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        setLoading(true);
        setErro("");
        const res = await fetch(`/api/backoffice/presenca?filtro=${filtro}`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar");
        setAlunos(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setErro(e.message);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [filtro]);

  const filtroAtual = FILTROS.find((f) => f.value === filtro)!;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Presença de Alunos</Typography>
          <Typography color="text.secondary">
            Monitore o engajamento e acesso dos alunos à plataforma.
          </Typography>
        </Box>

        <Tabs value={filtro} onChange={(_, v) => setFiltro(v)} variant="scrollable">
          {FILTROS.map((f) => (
            <Tab key={f.value} value={f.value} label={f.label} />
          ))}
        </Tabs>

        {erro && <Alert severity="error">{erro}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : alunos.length === 0 ? (
          <Card variant="outlined">
            <CardContent>
              <Stack alignItems="center" py={4} spacing={1}>
                <PersonIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                <Typography variant="h6">Nenhum aluno encontrado</Typography>
                <Typography color="text.secondary">
                  Não há alunos nesta categoria no momento.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              {alunos.length} aluno{alunos.length > 1 ? "s" : ""} encontrado{alunos.length > 1 ? "s" : ""}
            </Typography>
            {alunos.map((aluno) => (
              <Card key={aluno.id} variant="outlined">
                <CardContent sx={{ p: "12px 16px !important" }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {filtro === "online" && (
                        <FiberManualRecordIcon sx={{ color: "success.main", fontSize: 14 }} />
                      )}
                      <Box>
                        <Typography fontWeight={600}>
                          {aluno.firstName} {aluno.lastName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {aluno.email}
                          {aluno.phone ? ` · ${aluno.phone}` : ""}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      {aluno.turma && (
                        <Chip label={aluno.turma.nome} size="small" variant="outlined" />
                      )}
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={formatarUltimoAcesso(aluno.lastLoginAt)}
                        size="small"
                        color={filtroAtual.color}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
