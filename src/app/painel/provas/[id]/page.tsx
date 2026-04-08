"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SecurityIcon from "@mui/icons-material/Security";
import TimerIcon from "@mui/icons-material/Timer";
import AssignmentIcon from "@mui/icons-material/Assignment";

type Alternativa = {
  id: string;
  texto: string;
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
  tempoDuracaoMinutos: number;
  percentualMinimoAprovacao: number;
  status: "RASCUNHO" | "ATIVA" | "INATIVA" | "ENCERRADA";
  perguntas: Pergunta[];
};

type RespostasState = Record<string, string>;
type Etapa = "instrucoes" | "prova" | "fraude";

const regras = [
  {
    icon: "📋",
    titulo: "Copiar e colar proibido",
    descricao:
      "O uso de copiar (Ctrl+C) e colar (Ctrl+V) durante a prova é monitorado e resultará em desclassificação imediata.",
  },
  {
    icon: "🔒",
    titulo: "Não troque de aba",
    descricao:
      "Sair desta aba ou minimizar o navegador durante a prova será detectado e resultará em desclassificação imediata.",
  },
  {
    icon: "📸",
    titulo: "Print de tela proibido",
    descricao:
      "Qualquer tentativa de captura de tela será detectada e resultará em desclassificação imediata.",
  },
  {
    icon: "⏱️",
    titulo: "Respeite o tempo",
    descricao:
      "A prova possui tempo limite. Ao esgotar o tempo, ela será encerrada automaticamente.",
  },
];

export default function RealizarProvaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const iniciouRef = useRef(false);
  const fraudeEnviadaRef = useRef(false);

  const [etapa, setEtapa] = useState<Etapa>("instrucoes");
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [prova, setProva] = useState<Prova | null>(null);
  const [respostas, setRespostas] = useState<RespostasState>({});
  const [iniciando, setIniciando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [tempoRestante, setTempoRestante] = useState<number | null>(null);
  const [motivoFraude, setMotivoFraude] = useState("");
  const [tentouFinalizar, setTentouFinalizar] = useState(false);
  const perguntaRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ─── Iniciar prova ───────────────────────────────────────────────
  const iniciarProva = async () => {
    if (iniciouRef.current) return;
    iniciouRef.current = true;

    try {
      setIniciando(true);
      setErro("");

      const response = await fetch(`/api/painel/provas/${params.id}/iniciar`, {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao iniciar prova.");
      }

      const provaApi = result?.prova as Prova;
      setProva(provaApi);
      setTempoRestante((provaApi?.tempoDuracaoMinutos || 0) * 60);
      setEtapa("prova");
    } catch (error: any) {
      setErro(error.message || "Erro ao iniciar prova.");
      iniciouRef.current = false;
    } finally {
      setIniciando(false);
      setLoading(false);
    }
  };

  // ─── Finalizar prova ─────────────────────────────────────────────
  const finalizarProva = async (
    tempoEsgotado = false,
    fraude = false,
    motivo?: string
  ) => {
    if (!prova || finalizando) return;

    try {
      setFinalizando(true);
      setErro("");
      setSucesso("");

      const payload = {
        respostas: prova.perguntas.map((pergunta) => ({
          perguntaId: pergunta.id,
          alternativaId: respostas[pergunta.id] || null,
        })),
        fraudeDetectada: fraude,
        motivoFraude: fraude
          ? motivo
          : tempoEsgotado
          ? "Tempo esgotado"
          : undefined,
      };

      const response = await fetch(
        `/api/painel/provas/${params.id}/finalizar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Erro ao finalizar prova.");
      }

      setSucesso("Prova finalizada.");

      setTimeout(() => {
        router.push(`/painel/provas/resultado/${result.id}`);
      }, 1500);
    } catch (error: any) {
      setErro(error.message || "Erro ao finalizar prova.");
    } finally {
      setFinalizando(false);
    }
  };

  // ─── Detectar fraude ─────────────────────────────────────────────
  const detectarFraude = (motivo: string) => {
    if (etapa !== "prova" || fraudeEnviadaRef.current) return;
    fraudeEnviadaRef.current = true;
    setMotivoFraude(motivo);
    setEtapa("fraude");
    finalizarProva(false, true, motivo);
  };

  // Troca de aba / visibilidade
 // Print de tela
useEffect(() => {
  if (etapa !== "prova") return;

  // Detecta perda de foco da janela (PrintScreen abre ferramenta de recorte no Windows)
  const handleBlur = () => {
    detectarFraude("Tentativa de captura de tela detectada");
  };

  const handlePrint = () =>
    detectarFraude("Tentativa de impressão/captura detectada");

  window.addEventListener("blur", handleBlur);
  window.addEventListener("beforeprint", handlePrint);

  return () => {
    window.removeEventListener("blur", handleBlur);
    window.removeEventListener("beforeprint", handlePrint);
  };
}, [etapa]);

  // Copiar e colar
  useEffect(() => {
    if (etapa !== "prova") return;

    const handleCopy = () =>
      detectarFraude("Tentativa de cópia de conteúdo detectada");
    const handlePaste = () =>
      detectarFraude("Tentativa de colar conteúdo detectada");
    const handleCut = () =>
      detectarFraude("Tentativa de recortar conteúdo detectada");

    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
    };
  }, [etapa]);

  // Print de tela
  useEffect(() => {
    if (etapa !== "prova") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "PrintScreen" ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5"))
      ) {
        detectarFraude("Tentativa de captura de tela detectada");
      }
    };

    const handlePrint = () =>
      detectarFraude("Tentativa de impressão/captura detectada");

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("beforeprint", handlePrint);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("beforeprint", handlePrint);
    };
  }, [etapa]);

  // Temporizador
  useEffect(() => {
    if (tempoRestante === null || etapa !== "prova") return;

    if (tempoRestante <= 0) {
      finalizarProva(true);
      return;
    }

    const timer = setInterval(() => {
      setTempoRestante((prev) => (prev !== null ? prev - 1 : prev));
    }, 1000);

    return () => clearInterval(timer);
  }, [tempoRestante, etapa]);

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const totalRespondidas = useMemo(
    () => Object.values(respostas).filter(Boolean).length,
    [respostas]
  );

  const selecionarAlternativa = (perguntaId: string, alternativaId: string) => {
    setRespostas((prev) => ({ ...prev, [perguntaId]: alternativaId }));
  };

  const handleFinalizarClick = () => {
    if (!prova) return;
    const naoRespondidas = prova.perguntas.filter((p) => !respostas[p.id]);
    if (naoRespondidas.length > 0) {
      setTentouFinalizar(true);
      const primeira = naoRespondidas[0];
      const el = perguntaRefs.current[primeira.id];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    finalizarProva(false);
  };

  // ─── TELA: Instruções ────────────────────────────────────────────
  if (etapa === "instrucoes") {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Stack spacing={4}>
          <Stack spacing={1} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <AssignmentIcon sx={{ color: "white", fontSize: 32 }} />
            </Box>
            <Typography variant="h4" fontWeight={700}>
              Antes de começar
            </Typography>
            <Typography color="text.secondary" maxWidth={480}>
              Leia atentamente as regras abaixo. O descumprimento de qualquer
              uma delas resultará em desclassificação imediata e automática.
            </Typography>
          </Stack>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <SecurityIcon color="error" />
                  <Typography variant="h6" fontWeight={700} color="error">
                    Regras de integridade
                  </Typography>
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  {regras.map((regra, i) => (
                    <Card
                      key={i}
                      variant="outlined"
                      sx={{
                        borderRadius: 2,
                        borderColor: "warning.light",
                        bgcolor: "warning.50",
                      }}
                    >
                      <CardContent sx={{ py: "12px !important" }}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Typography fontSize={24}>{regra.icon}</Typography>
                          <Box>
                            <Typography fontWeight={700} fontSize={14}>
                              {regra.titulo}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {regra.descricao}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TimerIcon color="primary" />
                <Box>
                  <Typography fontWeight={700}>Monitoramento ativo</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Durante toda a prova, o sistema monitora automaticamente
                    ações suspeitas. Qualquer violação encerra a prova
                    imediatamente.
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Li e compreendi todas as regras acima e estou ciente de que o
                  descumprimento resultará em desclassificação imediata.
                </Typography>
              }
            />

            {erro && <Alert severity="error">{erro}</Alert>}

            <Button
              variant="contained"
              size="large"
              disabled={!aceitouTermos || iniciando}
              onClick={iniciarProva}
              sx={{ py: 1.5, fontSize: 16, fontWeight: 700 }}
            >
              {iniciando ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CircularProgress size={20} color="inherit" />
                  <span>Iniciando...</span>
                </Stack>
              ) : (
                "Iniciar prova"
              )}
            </Button>
          </Stack>
        </Stack>
      </Container>
    );
  }

  // ─── TELA: Fraude detectada ──────────────────────────────────────
  if (etapa === "fraude") {
    return (
      <Container maxWidth="sm" sx={{ py: 10 }}>
        <Card
          variant="outlined"
          sx={{ borderRadius: 3, borderColor: "error.main" }}
        >
          <CardContent>
            <Stack spacing={3} alignItems="center" textAlign="center" py={2}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  bgcolor: "error.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <WarningAmberIcon sx={{ color: "error.main", fontSize: 40 }} />
              </Box>

              <Stack spacing={1}>
                <Typography variant="h5" fontWeight={700} color="error">
                  Prova encerrada
                </Typography>
                <Typography color="text.secondary">
                  Uma violação das regras foi detectada e sua prova foi
                  encerrada automaticamente.
                </Typography>
              </Stack>

              <Card
                variant="outlined"
                sx={{ width: "100%", bgcolor: "error.50", borderColor: "error.light" }}
              >
                <CardContent sx={{ py: "12px !important" }}>
                  <Typography variant="body2" color="error.dark" fontWeight={600}>
                    Motivo: {motivoFraude}
                  </Typography>
                </CardContent>
              </Card>

              <Typography variant="body2" color="text.secondary">
                Seu resultado foi registrado como <strong>desclassificado</strong>.
                Entre em contato com a administração caso acredite que isso foi
                um erro.
              </Typography>

              {finalizando ? (
                <CircularProgress size={24} />
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => router.push("/painel/provas")}
                >
                  Voltar para provas
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // ─── TELA: Loading ───────────────────────────────────────────────
  if (loading || iniciando || !prova) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Carregando prova...</Typography>
        </Stack>
      </Container>
    );
  }

  // ─── TELA: Prova ─────────────────────────────────────────────────
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {prova.titulo}
          </Typography>
          {prova.descricao && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              {prova.descricao}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Chip label={`${prova.tempoDuracaoMinutos} min`} />
          <Chip label={`Aprovação ${prova.percentualMinimoAprovacao}%`} />
          <Chip
            label={`Respondidas ${totalRespondidas}/${prova.perguntas.length}`}
          />
          {tempoRestante !== null && (
            <Chip
              label={`Tempo restante ${formatarTempo(tempoRestante)}`}
              color={tempoRestante <= 60 ? "error" : "primary"}
            />
          )}
        </Stack>

        {erro && <Alert severity="error">{erro}</Alert>}
        {sucesso && <Alert severity="success">{sucesso}</Alert>}

        <Stack spacing={2}>
          {prova.perguntas.map((pergunta, index) => {
            const naoRespondida = tentouFinalizar && !respostas[pergunta.id];
            return (
              <Card
                key={pergunta.id}
                ref={(el) => { perguntaRefs.current[pergunta.id] = el; }}
                sx={naoRespondida ? { borderColor: "error.main", borderWidth: 2, borderStyle: "solid" } : {}}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Pergunta {index + 1}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>{pergunta.enunciado}</Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Valor: {pergunta.valorNota}
                      </Typography>
                    </Box>

                    {naoRespondida && (
                      <Alert severity="error">
                        Esta pergunta precisa ser respondida antes de finalizar a prova.
                      </Alert>
                    )}

                    <Divider />

                    <RadioGroup
                      value={respostas[pergunta.id] || ""}
                      onChange={(e) => {
                        selecionarAlternativa(pergunta.id, e.target.value);
                      }}
                    >
                      <Stack spacing={1}>
                        {pergunta.alternativas.map((alternativa) => (
                          <FormControlLabel
                            key={alternativa.id}
                            value={alternativa.id}
                            control={<Radio />}
                            label={alternativa.texto}
                          />
                        ))}
                      </Stack>
                    </RadioGroup>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button
            variant="outlined"
            onClick={() => router.push("/painel/provas")}
            disabled={finalizando}
          >
            Voltar
          </Button>

          <Button
            variant="contained"
            onClick={handleFinalizarClick}
            disabled={finalizando}
          >
            {finalizando ? "Finalizando..." : "Finalizar prova"}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}