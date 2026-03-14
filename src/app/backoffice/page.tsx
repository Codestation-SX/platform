"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import Link from "next/link";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import GroupsIcon from "@mui/icons-material/Groups";
import PaymentIcon from "@mui/icons-material/Payment";
import GradeIcon from "@mui/icons-material/Grade";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DownloadIcon from "@mui/icons-material/Download";

// ── Paleta inline ─────────────────────────────────────
const C = {
  cyan: "#63b3ed",
  cyan2: "#90cdf4",
  green: "#68d391",
  yellow: "#f6e05e",
  red: "#fc8181",
  purple: "#b794f4",
  muted: "#718096",
  panel: "#0f1628",
  surface: "#0d1225",
  border: "rgba(99,179,237,0.1)",
};

// ── Stat Card ─────────────────────────────────────────
function StatCard({
  label,
  value,
  delta,
  deltaUp,
  icon,
  accentColor,
  delay,
}: {
  label: string;
  value: string;
  delta: string;
  deltaUp: boolean;
  icon: React.ReactNode;
  accentColor: string;
  delay: string;
}) {
  return (
    <Card
      className={`fade-up-${delay}`}
      sx={{
        position: "relative",
        overflow: "hidden",
        p: 2.5,
        cursor: "default",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
          opacity: 0.6,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 14,
          right: 14,
          fontSize: "1.4rem",
          opacity: 0.12,
          color: accentColor,
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          color: C.muted,
          letterSpacing: "2px",
          textTransform: "uppercase",
          mb: 1.5,
          fontSize: "0.625rem",
        }}
      >
        <Box
          component="span"
          sx={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            bgcolor: accentColor,
            boxShadow: `0 0 4px ${accentColor}`,
            flexShrink: 0,
          }}
        />
        {label}
      </Typography>

      <Typography
        sx={{
          fontFamily: "var(--font-syne), sans-serif",
          fontSize: "2rem",
          fontWeight: 800,
          color: "#e2e8f0",
          lineHeight: 1,
          mb: 1,
        }}
      >
        {value}
      </Typography>

      <Typography
        variant="caption"
        sx={{ color: deltaUp ? C.green : C.red, display: "flex", alignItems: "center", gap: 0.5 }}
      >
        {deltaUp ? "↑" : "↓"} {delta}
      </Typography>
    </Card>
  );
}

// ── Hardcoded students ────────────────────────────────
const STUDENTS = [
  { initials: "AL", name: "Ana Lima", email: "ana@email.com", turma: "QA · T1", turmaColor: "primary", status: "Ativo", nota: 9.2, notaColor: C.green, pgto: "Pago", pgtoVariant: "success" },
  { initials: "CR", name: "Carlos Rocha", email: "carlos@email.com", turma: "DEV · T2", turmaColor: "secondary", status: "Ativo", nota: 8.7, notaColor: C.green, pgto: "Pendente", pgtoVariant: "warning" },
  { initials: "MS", name: "Maria Santos", email: "maria@email.com", turma: "QA · T1", turmaColor: "primary", status: "Inativo", nota: 7.1, notaColor: C.yellow, pgto: "Pago", pgtoVariant: "success" },
  { initials: "PO", name: "Pedro Oliveira", email: "pedro@email.com", turma: "DEV · T3", turmaColor: "secondary", status: "Ativo", nota: 5.8, notaColor: C.red, pgto: "Atrasado", pgtoVariant: "error" },
  { initials: "JF", name: "Julia Ferreira", email: "julia@email.com", turma: "QA · T2", turmaColor: "primary", status: "Ativo", nota: 9.8, notaColor: C.green, pgto: "Pago", pgtoVariant: "success" },
] as const;

// ── Hardcoded activity ────────────────────────────────
const ACTIVITY = [
  { dot: C.green, text: ["Ana Lima", " entregou a prova de QA"], time: "há 5 min" },
  { dot: C.yellow, text: ["Pagamento de ", "Carlos Rocha", " pendente"], time: "há 18 min" },
  { dot: C.cyan, text: ["Nova turma ", "DEV T4", " criada"], time: "há 1h" },
  { dot: C.purple, text: ["Julia Ferreira", " concluiu módulo 3"], time: "há 2h" },
  { dot: C.red, text: ["Pagamento de ", "Pedro Oliveira", " atrasado"], time: "há 3h" },
] as const;

// ── Bar chart data ─────────────────────────────────────
const BARS = [
  { label: "SEG", h: 40 }, { label: "TER", h: 65 }, { label: "QUA", h: 55 },
  { label: "QUI", h: 80 }, { label: "SEX", h: 95, active: true },
  { label: "SÁB", h: 30 }, { label: "DOM", h: 15 },
];

// ── Dashboard ──────────────────────────────────────────
export default function Dashboard() {
  return (
    <Box sx={{ p: { xs: 2, md: 3.5 } }}>

      {/* Page header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "flex-start" }} mb={3.5} gap={2}>
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-syne), sans-serif",
              fontSize: { xs: "1.5rem", md: "1.75rem" },
              fontWeight: 800,
              color: "#e2e8f0",
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
            }}
          >
            Dashboard{" "}
            <Box component="span" sx={{ color: C.cyan }}>
              _
            </Box>
          </Typography>
          <Typography variant="caption" sx={{ color: C.muted, letterSpacing: "0.5px" }}>
            {"// visão geral do sistema · atualizado agora"}
          </Typography>
        </Box>
        <Stack direction="row" gap={1} flexShrink={0}>
          <Button variant="outlined" size="small" startIcon={<DownloadIcon />}>
            Exportar
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddIcon />}
            component={Link}
            href="/backoffice/users"
          >
            Novo aluno
          </Button>
        </Stack>
      </Stack>

      {/* Stats grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
          gap: 2,
          mb: 3,
        }}
      >
        <StatCard label="Usuários ativos" value="30" delta="+3 este mês" deltaUp icon={<PeopleAltIcon />} accentColor={C.cyan} delay="1" />
        <StatCard label="Turmas ativas" value="4" delta="100% ocupação" deltaUp icon={<GroupsIcon />} accentColor={C.green} delay="2" />
        <StatCard label="Pagamentos" value="27" delta="3 pendentes" deltaUp={false} icon={<PaymentIcon />} accentColor={C.yellow} delay="3" />
        <StatCard label="Média de notas" value="8.4" delta="+0.3 vs último mês" deltaUp icon={<GradeIcon />} accentColor={C.purple} delay="4" />
      </Box>

      {/* Main grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 340px" }, gap: 2.5 }}>

        {/* Left: table + bar chart */}
        <Stack gap={0}>
          <Card className="fade-up-5">
            {/* Table header */}
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&::before": {
                    content: '""',
                    display: "block",
                    width: 3,
                    height: 14,
                    background: C.cyan,
                    borderRadius: 1,
                    boxShadow: `0 0 8px ${C.cyan}`,
                  },
                }}
              >
                Últimos Alunos
              </Typography>
              <Button
                component={Link}
                href="/backoffice/users"
                variant="outlined"
                size="small"
                sx={{ fontSize: "0.625rem", py: 0.5, px: 1 }}
              >
                Ver todos →
              </Button>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Aluno</TableCell>
                  <TableCell>Turma</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Nota</TableCell>
                  <TableCell>Pgto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {STUDENTS.map((s) => (
                  <TableRow key={s.email}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" gap={1.25}>
                        <Avatar
                          sx={{
                            width: 28,
                            height: 28,
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #2b6cb0, #1a365d)",
                            border: "1px solid rgba(99,179,237,0.2)",
                            color: C.cyan2,
                            borderRadius: "5px",
                          }}
                        >
                          {s.initials}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: "0.6875rem", fontWeight: 500, color: "#e2e8f0" }}>
                            {s.name}
                          </Typography>
                          <Typography sx={{ fontSize: "0.625rem", color: C.muted }}>
                            {s.email}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip label={s.turma} color={s.turmaColor as any} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={s.status}
                        size="small"
                        color={s.status === "Ativo" ? "success" : "warning"}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: s.notaColor }}>
                        {s.nota}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={s.pgto} size="small" color={s.pgtoVariant as any} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Bar chart */}
            <Box sx={{ px: 2.5, py: 1.75, borderTop: `1px solid ${C.border}` }}>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#e2e8f0",
                  mb: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&::before": {
                    content: '""',
                    display: "block",
                    width: 3,
                    height: 14,
                    background: C.cyan,
                    borderRadius: 1,
                    boxShadow: `0 0 8px ${C.cyan}`,
                  },
                }}
              >
                Acessos esta semana
              </Typography>
              <Stack direction="row" alignItems="flex-end" gap={0.75} sx={{ height: 70 }}>
                {BARS.map((b) => (
                  <Box
                    key={b.label}
                    sx={{
                      flex: 1,
                      height: `${b.h}%`,
                      borderRadius: "3px 3px 0 0",
                      bgcolor: b.active ? "rgba(99,179,237,0.4)" : "rgba(99,179,237,0.12)",
                      border: `1px solid ${b.active ? C.cyan : "rgba(99,179,237,0.2)"}`,
                      borderBottom: "none",
                      boxShadow: b.active ? `0 0 12px rgba(99,179,237,0.25)` : "none",
                      transition: "background 0.2s",
                      cursor: "default",
                      "&:hover": { bgcolor: "rgba(99,179,237,0.28)" },
                    }}
                  />
                ))}
              </Stack>
              <Stack direction="row" gap={0.75} mt={0.75}>
                {BARS.map((b) => (
                  <Typography
                    key={b.label}
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      fontSize: "0.5625rem",
                      color: b.active ? C.cyan : C.muted,
                      letterSpacing: "0.5px",
                    }}
                  >
                    {b.label}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Card>
        </Stack>

        {/* Right panel */}
        <Stack gap={2.5}>

          {/* Activity feed */}
          <Card className="fade-up-5">
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${C.border}` }}>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&::before": {
                    content: '""',
                    display: "block",
                    width: 3,
                    height: 14,
                    background: C.cyan,
                    borderRadius: 1,
                    boxShadow: `0 0 8px ${C.cyan}`,
                  },
                }}
              >
                Atividade Recente
              </Typography>
            </Box>
            <CardContent>
              {ACTIVITY.map((a, i) => (
                <Box key={i}>
                  <Stack
                    direction="row"
                    gap={1.5}
                    sx={{
                      py: 1.25,
                      px: 0.5,
                      borderRadius: 1,
                      transition: "background 0.15s",
                      "&:hover": { bgcolor: "rgba(99,179,237,0.03)" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: a.dot,
                        boxShadow: `0 0 6px ${a.dot}`,
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                    />
                    <Box>
                      <Typography sx={{ fontSize: "0.6875rem", color: "#e2e8f0", lineHeight: 1.5 }}>
                        {a.text.map((t, j) =>
                          j % 2 === 1 ? (
                            <Box key={j} component="span" sx={{ color: C.cyan }}>
                              {t}
                            </Box>
                          ) : (
                            t
                          )
                        )}
                      </Typography>
                      <Typography sx={{ fontSize: "0.5625rem", color: C.muted, mt: 0.25, letterSpacing: "0.5px" }}>
                        {a.time}
                      </Typography>
                    </Box>
                  </Stack>
                  {i < ACTIVITY.length - 1 && <Divider sx={{ borderColor: "rgba(255,255,255,0.03)" }} />}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* System log terminal */}
          <Card className="fade-up-5">
            <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${C.border}` }}>
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  color: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  "&::before": {
                    content: '""',
                    display: "block",
                    width: 3,
                    height: 14,
                    background: C.cyan,
                    borderRadius: 1,
                    boxShadow: `0 0 8px ${C.cyan}`,
                  },
                }}
              >
                Log do Sistema
              </Typography>
            </Box>
            <CardContent>
              <Box
                sx={{
                  bgcolor: "#050810",
                  border: `1px solid ${C.border}`,
                  borderRadius: 1.5,
                  overflow: "hidden",
                }}
              >
                {/* Terminal title bar */}
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={0.75}
                  sx={{ px: 1.5, py: 1, bgcolor: C.surface, borderBottom: `1px solid ${C.border}` }}
                >
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: C.red }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: C.yellow }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: C.green }} />
                  <Typography sx={{ fontSize: "0.625rem", color: C.muted, ml: 1 }}>
                    system.log
                  </Typography>
                </Stack>
                {/* Terminal body */}
                <Box sx={{ p: 1.5, fontFamily: "var(--font-jetbrains), monospace", fontSize: "0.6875rem", lineHeight: 1.8 }}>
                  {[
                    { prompt: true, cmd: "status --all" },
                    { out: "users.active", val: "30/30", valColor: C.green },
                    { out: "turmas.running", val: "4", valColor: C.green },
                    { out: "payments.pending", val: "3", valColor: C.red },
                    { out: "system.health", val: "OK", valColor: C.green },
                  ].map((line, i) => (
                    <Stack key={i} direction="row" gap={1}>
                      {line.prompt ? (
                        <>
                          <Typography component="span" sx={{ color: "#2b6cb0", fontSize: "inherit" }}>$</Typography>
                          <Typography component="span" sx={{ color: C.green, fontSize: "inherit" }}>{line.cmd}</Typography>
                        </>
                      ) : (
                        <Typography component="span" sx={{ color: C.muted, fontSize: "inherit", pl: 2 }}>
                          {line.out}{" "}
                          <Box component="span" sx={{ color: line.valColor }}>
                            {line.val}
                          </Box>
                        </Typography>
                      )}
                    </Stack>
                  ))}
                  <Stack direction="row" gap={1} mt={0.5}>
                    <Typography component="span" sx={{ color: "#2b6cb0", fontSize: "0.6875rem" }}>$</Typography>
                    <Box
                      component="span"
                      className="cursor-blink"
                      sx={{ color: C.green, fontSize: "0.6875rem", fontFamily: "inherit" }}
                    >
                      _
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </CardContent>
          </Card>

        </Stack>
      </Box>
    </Box>
  );
}
