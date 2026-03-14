"use client";
import { createTheme } from "@mui/material/styles";
import { ptBR } from "@mui/x-data-grid/locales";
import { alpha } from "@mui/material/styles";

// ── Tech Dark Palette ─────────────────────────────────────────────
const cyan = {
  50: "#ebf8ff",
  100: "#bee3f8",
  200: "#90cdf4",
  300: "#63b3ed",
  400: "#4299e1",
  500: "#3182ce",
  600: "#2b6cb0",
  700: "#2c5282",
  800: "#2a4365",
  900: "#1A365D",
};

const bg = {
  default: "#050810",
  paper: "#0f1628",
  panel: "#080c18",
  surface: "#0d1225",
};

const techGreen = "#68d391";
const techYellow = "#f6e05e";
const techRed = "#fc8181";
const techPurple = "#b794f4";

export const backofficeTheme = createTheme(
  {
    cssVariables: { colorSchemeSelector: "data-mui-color-scheme" },
    colorSchemes: {
      dark: {
        palette: {
          primary: {
            main: cyan[300],
            light: cyan[200],
            dark: cyan[600],
            contrastText: bg.default,
          },
          secondary: {
            main: techPurple,
            light: "#d6bcfa",
            dark: "#553c9a",
            contrastText: "#fff",
          },
          success: {
            main: techGreen,
            light: "#9ae6b4",
            dark: "#276749",
          },
          warning: {
            main: techYellow,
            light: "#faf089",
            dark: "#b7791f",
          },
          error: {
            main: techRed,
            light: "#feb2b2",
            dark: "#c53030",
          },
          background: {
            default: bg.default,
            paper: bg.paper,
          },
          text: {
            primary: "#e2e8f0",
            secondary: "#718096",
          },
          divider: "rgba(99,179,237,0.1)",
          action: {
            hover: "rgba(99,179,237,0.08)",
            selected: "rgba(99,179,237,0.12)",
          },
        },
      },
    },
    defaultColorScheme: "dark",
    typography: {
      fontFamily: "'JetBrains Mono', 'Space Mono', monospace",
      h1: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        letterSpacing: "-0.5px",
      },
      h2: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
      },
      h3: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
      },
      h4: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 700,
      },
      h5: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 600,
      },
      h6: {
        fontFamily: "'Syne', sans-serif",
        fontWeight: 600,
      },
      body1: { fontSize: "0.875rem" },
      body2: { fontSize: "0.8125rem" },
      caption: { fontSize: "0.75rem", letterSpacing: "0.5px" },
    },
    shape: { borderRadius: 8 },
    components: {
      // ── Buttons ──────────────────────────────────────────
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.5px",
            fontSize: "0.75rem",
            boxShadow: "none",
            "&:hover": { boxShadow: "none" },
          },
          containedPrimary: {
            backgroundColor: "rgba(99,179,237,0.12)",
            border: `1px solid ${cyan[600]}`,
            color: cyan[300],
            "&:hover": {
              backgroundColor: "rgba(99,179,237,0.2)",
              boxShadow: `0 0 16px rgba(99,179,237,0.25)`,
            },
            "&:active": { backgroundColor: "rgba(99,179,237,0.15)" },
          },
          outlinedPrimary: {
            border: `1px solid rgba(99,179,237,0.3)`,
            color: "#718096",
            "&:hover": {
              border: `1px solid ${cyan[600]}`,
              color: cyan[200],
              backgroundColor: "transparent",
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 6,
            border: "1px solid rgba(99,179,237,0.12)",
            backgroundColor: bg.surface,
            color: "#718096",
            "&:hover": {
              borderColor: cyan[600],
              color: cyan[300],
              backgroundColor: "rgba(99,179,237,0.08)",
            },
          },
        },
      },
      // ── Cards / Paper ──────────────────────────────────
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: bg.paper,
            border: "1px solid rgba(99,179,237,0.08)",
            borderRadius: 10,
            boxShadow: "none",
            "&:hover": {
              borderColor: "rgba(99,179,237,0.15)",
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: { padding: 0, "&:last-child": { paddingBottom: 0 } },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: bg.paper,
            border: "1px solid rgba(99,179,237,0.08)",
          },
        },
      },
      // ── Inputs ─────────────────────────────────────────
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: bg.surface,
            color: "#e2e8f0",
            fontSize: "0.8125rem",
            "& fieldset": { borderColor: "rgba(99,179,237,0.15)" },
            "&:hover fieldset": { borderColor: "rgba(99,179,237,0.35)" },
            "&.Mui-focused fieldset": {
              borderColor: cyan[300],
              boxShadow: `0 0 0 3px rgba(99,179,237,0.12)`,
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: "#718096",
            fontSize: "0.8125rem",
            "&.Mui-focused": { color: cyan[300] },
          },
        },
      },
      // ── Table ──────────────────────────────────────────
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-root": {
              backgroundColor: bg.surface,
              color: "#4a5568",
              fontSize: "0.625rem",
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontWeight: 500,
              borderBottom: "1px solid rgba(99,179,237,0.08)",
            },
          },
        },
      },
      MuiTableBody: {
        styleOverrides: {
          root: {
            "& .MuiTableRow-root": {
              "&:hover": { backgroundColor: "rgba(99,179,237,0.03)" },
            },
            "& .MuiTableCell-root": {
              fontSize: "0.75rem",
              borderBottom: "1px solid rgba(255,255,255,0.03)",
              color: "#e2e8f0",
            },
          },
        },
      },
      // ── Drawer (Sidebar) ───────────────────────────────
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: `linear-gradient(180deg, #080c18 0%, #0a0f1e 50%, #080c18 100%)`,
            borderRight: "1px solid rgba(99,179,237,0.1)",
            boxShadow: "4px 0 24px rgba(5,8,16,0.8)",
          },
        },
      },
      // ── Chips ──────────────────────────────────────────
      MuiChip: {
        defaultProps: { size: "small" },
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontWeight: 600,
            fontSize: "0.625rem",
            letterSpacing: "0.5px",
            height: 20,
          },
          colorPrimary: {
            backgroundColor: "rgba(99,179,237,0.1)",
            border: "1px solid rgba(99,179,237,0.25)",
            color: cyan[300],
          },
          colorSuccess: {
            backgroundColor: "rgba(104,211,145,0.1)",
            border: "1px solid rgba(104,211,145,0.25)",
            color: techGreen,
          },
          colorWarning: {
            backgroundColor: "rgba(246,224,94,0.1)",
            border: "1px solid rgba(246,224,94,0.25)",
            color: techYellow,
          },
          colorError: {
            backgroundColor: "rgba(252,129,129,0.1)",
            border: "1px solid rgba(252,129,129,0.25)",
            color: techRed,
          },
          colorSecondary: {
            backgroundColor: "rgba(183,148,244,0.1)",
            border: "1px solid rgba(183,148,244,0.25)",
            color: techPurple,
          },
        },
      },
      // ── Alert ──────────────────────────────────────────
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontSize: "0.8125rem",
          },
          standardSuccess: {
            backgroundColor: "rgba(104,211,145,0.08)",
            border: "1px solid rgba(104,211,145,0.2)",
            color: techGreen,
          },
          standardError: {
            backgroundColor: "rgba(252,129,129,0.08)",
            border: "1px solid rgba(252,129,129,0.2)",
            color: techRed,
          },
          standardWarning: {
            backgroundColor: "rgba(246,224,94,0.08)",
            border: "1px solid rgba(246,224,94,0.2)",
            color: techYellow,
          },
          standardInfo: {
            backgroundColor: "rgba(99,179,237,0.08)",
            border: "1px solid rgba(99,179,237,0.2)",
            color: cyan[300],
          },
        },
      },
      // ── Divider ────────────────────────────────────────
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: "rgba(99,179,237,0.08)" },
        },
      },
      // ── Tooltip ────────────────────────────────────────
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: "#0d1225",
            border: "1px solid rgba(99,179,237,0.2)",
            color: "#e2e8f0",
            fontSize: "0.75rem",
            borderRadius: 6,
          },
        },
      },
      // ── LinearProgress ─────────────────────────────────
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            height: 4,
            borderRadius: 4,
            backgroundColor: "rgba(99,179,237,0.1)",
            "& .MuiLinearProgress-bar": {
              background: `linear-gradient(90deg, ${cyan[600]}, ${cyan[300]})`,
              boxShadow: `0 0 8px rgba(99,179,237,0.4)`,
            },
          },
        },
      },
    },
  },
  ptBR
);
