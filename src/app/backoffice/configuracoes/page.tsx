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
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SaveIcon from "@mui/icons-material/Save";

export default function ConfiguracoesPage() {
  const [precoCurso, setPrecoCurso] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    fetch("/api/backoffice/configuracoes")
      .then((r) => r.json())
      .then((data) => {
        setPrecoCurso(data.preco_curso ?? "1200");
      })
      .catch(() => setErro("Erro ao carregar configurações."))
      .finally(() => setLoading(false));
  }, []);

  const handleSalvar = async () => {
    const valor = parseFloat(precoCurso.replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      setErro("Informe um valor válido maior que zero.");
      return;
    }

    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      const res = await fetch("/api/backoffice/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preco_curso: String(valor) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar.");
      setSucesso("Configurações salvas com sucesso!");
    } catch (err: any) {
      setErro(err.message || "Erro ao salvar configurações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SettingsIcon color="primary" />
            <Typography variant="h4" fontWeight={700}>Configurações</Typography>
          </Stack>
        </Box>

        {loading ? (
          <Stack alignItems="center" py={6}>
            <CircularProgress />
          </Stack>
        ) : (
          <Card variant="outlined">
            <CardContent sx={{ p: "24px !important" }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" fontWeight={600} mb={0.5}>
                    Preço do curso
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Valor cobrado no momento do pagamento. Altere aqui para promoções ou reajustes.
                  </Typography>
                  <TextField
                    label="Valor do curso (R$)"
                    value={precoCurso}
                    onChange={(e) => setPrecoCurso(e.target.value)}
                    size="small"
                    type="number"
                    inputProps={{ min: 1, step: "0.01" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoneyIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: 220 }}
                  />
                </Box>

                {erro && <Alert severity="error">{erro}</Alert>}
                {sucesso && <Alert severity="success">{sucesso}</Alert>}

                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    onClick={handleSalvar}
                    disabled={saving}
                  >
                    {saving ? "Salvando..." : "Salvar configurações"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
