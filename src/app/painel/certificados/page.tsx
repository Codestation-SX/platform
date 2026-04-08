"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
  Chip,
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
import { useSession } from "next-auth/react";
import { gerarCertificadoPDF } from "@/utils/gerarCertificadoPDF";

type Certificado = {
  id: string;
  emitidoEm: string;
  turma: { id: string; nome: string };
};

export default function MeusCertificadosPage() {
  const { data: session } = useSession();
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetch("/api/painel/certificados", { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erro ao carregar certificados.");
        setCertificados(data);
      } catch (err: any) {
        setErro(err.message || "Erro ao carregar certificados.");
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const imprimir = (cert: Certificado) => {
    if (!session?.user) return;
    gerarCertificadoPDF({
      nomeAluno: session.user.name,
      cpf: session.user.cpf,
      email: session.user.email,
      dataNascimento: session.user.birthDate,
      cidade: session.user.cidade,
      estado: session.user.estado,
      nomeTurma: cert.turma.nome,
      emitidoEm: cert.emitidoEm,
      certificadoId: cert.id,
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
            <WorkspacePremiumIcon color="primary" />
            <Typography variant="h4" fontWeight={700}>Meus Certificados</Typography>
          </Stack>
          <Typography color="text.secondary">
            Certificados de conclusão emitidos para você.
          </Typography>
        </Box>

        {erro && <Alert severity="error">{erro}</Alert>}

        {loading ? (
          <Stack alignItems="center" py={8}>
            <CircularProgress />
          </Stack>
        ) : certificados.length === 0 ? (
          <Card variant="outlined">
            <CardContent sx={{ p: "32px !important", textAlign: "center" }}>
              <WorkspacePremiumIcon sx={{ fontSize: 56, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Nenhum certificado disponível
              </Typography>
              <Typography color="text.secondary">
                Seus certificados aparecerão aqui quando forem emitidos pelo administrador.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Curso / Turma</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Data de emissão</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {certificados.map((cert) => (
                  <TableRow key={cert.id} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <WorkspacePremiumIcon fontSize="small" color="primary" />
                        <Box>
                          <Typography fontWeight={600}>{cert.turma.nome}</Typography>
                          <Chip
                            label="Concluído"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(cert.emitidoEm).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PrintIcon />}
                        onClick={() => imprimir(cert)}
                      >
                        Imprimir
                      </Button>
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
