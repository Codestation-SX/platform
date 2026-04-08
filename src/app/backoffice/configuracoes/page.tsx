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
import PixIcon from "@mui/icons-material/Pix";
import CreditCardIcon from "@mui/icons-material/CreditCard";

export default function ConfiguracoesPage() {
  const [precoPix, setPrecoPix] = useState("");
  const [precoCartao, setPrecoCartao] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    fetch("/api/backoffice/configuracoes")
      .then((r) => r.json())
      .then((data) => {
        setPrecoPix(data.preco_pix ?? "6000");
        setPrecoCartao(data.preco_cartao ?? "1200");
      })
      .catch(() => setErro("Erro ao carregar configurações."))
      .finally(() => setLoading(false));
  }, []);

  const handleSalvar = async () => {
    const valorPix = parseFloat(precoPix.replace(",", "."));
    const valorCartao = parseFloat(precoCartao.replace(",", "."));

    if (isNaN(valorPix) || valorPix <= 0) {
      setErro("Informe um valor válido para PIX maior que zero.");
      return;
    }
    if (isNaN(valorCartao) || valorCartao <= 0) {
      setErro("Informe um valor válido para cartão de crédito maior que zero.");
      return;
    }

    setSaving(true);
    setErro("");
    setSucesso("");

    try {
      const res = await fetch("/api/backoffice/configuracoes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preco_pix: String(valorPix),
          preco_cartao: String(valorCartao),
        }),
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
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Defina os valores cobrados por forma de pagamento. Altere para promoções ou reajustes.
                  </Typography>

                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="body2" fontWeight={600} mb={1} color="text.secondary">
                        Pagamento via PIX
                      </Typography>
                      <TextField
                        label="Valor à vista no PIX (R$)"
                        value={precoPix}
                        onChange={(e) => setPrecoPix(e.target.value)}
                        size="small"
                        type="number"
                        inputProps={{ min: 1, step: "0.01" }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PixIcon fontSize="small" color="success" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: 260 }}
                      />
                    </Box>

                    <Box>
                      <Typography variant="body2" fontWeight={600} mb={1} color="text.secondary">
                        Pagamento via Cartão de Crédito
                      </Typography>
                      <TextField
                        label="Valor no cartão de crédito (R$)"
                        value={precoCartao}
                        onChange={(e) => setPrecoCartao(e.target.value)}
                        size="small"
                        type="number"
                        inputProps={{ min: 1, step: "0.01" }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CreditCardIcon fontSize="small" color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ width: 260 }}
                      />
                    </Box>
                  </Stack>
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
