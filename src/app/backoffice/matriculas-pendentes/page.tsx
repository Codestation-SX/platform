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
  Stack,
  Typography,
} from "@mui/material";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const educationLabels: Record<string, string> = {
  NONE: "Sem escolaridade",
  ELEMENTARY: "Ensino fundamental completo",
  ELEMENTARY_INCOMPLETE: "Ensino fundamental incompleto",
  HIGH_SCHOOL: "Ensino médio completo",
  HIGH_SCHOOL_INCOMPLETE: "Ensino médio incompleto",
  COLLEGE: "Ensino superior completo",
  COLLEGE_INCOMPLETE: "Ensino superior incompleto",
};

type Aluno = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  birthDate: string;
  educationLevel: string;
  phone: string | null;
  createdAt: string;
  address: {
    zipCode: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  } | null;
  payment: { status: string; createdAt: string } | null;
};

export default function MatriculasPendentesPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("/api/backoffice/matriculas-pendentes")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAlunos(data);
        else setErro(data.error || "Erro ao carregar dados");
      })
      .catch(() => setErro("Erro ao carregar dados"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Matrículas Pendentes
          </Typography>
          <Typography color="text.secondary">
            Alunos que se cadastraram mas não concluíram o pagamento.
          </Typography>
        </Box>

        {erro && <Alert severity="error">{erro}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : alunos.length === 0 ? (
          <Card>
            <CardContent>
              <Stack alignItems="center" spacing={1} py={3}>
                <PersonOffIcon sx={{ fontSize: 48, color: "text.secondary" }} />
                <Typography variant="h6">Nenhuma matrícula pendente</Typography>
                <Typography color="text.secondary">
                  Todos os alunos cadastrados concluíram o pagamento.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {alunos.map((aluno) => (
              <Card key={aluno.id}>
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
                          {aluno.firstName} {aluno.lastName}
                        </Typography>
                        <Typography color="text.secondary" variant="body2">
                          {aluno.email}
                        </Typography>
                      </Box>
                      <Chip
                        label={aluno.payment ? aluno.payment.status : "SEM PAGAMENTO"}
                        color={aluno.payment ? "warning" : "error"}
                        size="small"
                      />
                    </Stack>

                    <Divider />

                    <Stack direction={{ xs: "column", md: "row" }} spacing={3} flexWrap="wrap">
                      <Box>
                        <Typography variant="body2" color="text.secondary">CPF</Typography>
                        <Typography>{aluno.cpf}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Data de Nascimento</Typography>
                        <Typography>
                          {format(new Date(aluno.birthDate), "dd/MM/yyyy", { locale: ptBR })}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Escolaridade</Typography>
                        <Typography>{educationLabels[aluno.educationLevel] ?? aluno.educationLevel}</Typography>
                      </Box>
                      {aluno.phone && (
                        <Box>
                          <Typography variant="body2" color="text.secondary">Telefone</Typography>
                          <Typography>{aluno.phone}</Typography>
                        </Box>
                      )}
                      <Box>
                        <Typography variant="body2" color="text.secondary">Cadastrado em</Typography>
                        <Typography>
                          {format(new Date(aluno.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </Typography>
                      </Box>
                    </Stack>

                    {aluno.address && (
                      <>
                        <Divider />
                        <Box>
                          <Typography variant="body2" color="text.secondary" mb={0.5}>
                            Endereço
                          </Typography>
                          <Typography>
                            {aluno.address.street}, {aluno.address.number}
                            {aluno.address.complement ? ` — ${aluno.address.complement}` : ""}
                          </Typography>
                          <Typography>
                            {aluno.address.neighborhood} · {aluno.address.city}/{aluno.address.state} · CEP {aluno.address.zipCode}
                          </Typography>
                        </Box>
                      </>
                    )}
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
