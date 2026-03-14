"use client";
import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CodeIcon from "@mui/icons-material/Code";

const modules = [
  {
    number: "01",
    title: "Fundamentos de Testes de Software",
    description: "Neste módulo o aluno aprende os conceitos essenciais da área de QA.",
    content: ["O que é Quality Assurance (QA)", "Tipos de testes de software", "Ambientes de testes (desenvolvimento, homologação e produção)", "Pirâmide de testes", "Introdução a testes de API"],
    tools: [],
  },
  {
    number: "02",
    title: "Metodologias Ágeis",
    description: "Neste módulo o aluno aprende como funciona o desenvolvimento de software nas empresas.",
    content: ["O que é Scrum", "Cerimônias do Scrum", "Planning", "Daily", "Review", "Retrospectiva"],
    tools: [],
  },
  {
    number: "03",
    title: "Testes Manuais",
    description: "Neste módulo o aluno aprende a atuar como QA em projetos reais.",
    content: ["Escrita de cenários de teste", "Análise de regras de negócio", "Transformação de regras de negócio em cenários", "Abertura de bugs", "Evidência de defeitos", "Uso de ferramentas de gestão"],
    tools: ["Linear"],
  },
  {
    number: "04",
    title: "Prototipação e Validação de Interface",
    description: "",
    content: ["Navegação em protótipos", "Validação de telas com base no protótipo", "Comparação entre protótipo e sistema", "Identificação de inconsistências de interface"],
    tools: ["Figma"],
  },
  {
    number: "05",
    title: "Lógica de Programação para QA",
    description: "",
    content: ["Introdução à lógica de programação", "Tipos de variáveis", "Estruturas condicionais (If, If/Else, Else If, Switch Case)", "Estruturas de repetição (For, While, Do While)"],
    tools: ["Java", "Eclipse"],
    project: "Desenvolvimento de uma calculadora em Java",
  },
  {
    number: "06",
    title: "Automação de Testes com Java",
    description: "",
    content: ["Introdução à automação de testes", "Selenium WebDriver", "Localização de elementos", "Interação com elementos", "Boas práticas de automação"],
    tools: ["Java", "Selenium", "GitHub"],
  },
  {
    number: "07",
    title: "Estrutura Profissional de Automação",
    description: "",
    content: ["Page Object Model", "Organização de projeto de automação", "Reutilização de código", "Estrutura profissional de testes automatizados"],
    tools: ["Selenium", "GitHub"],
  },
  {
    number: "08",
    title: "BDD e Automação com Cucumber",
    description: "",
    content: ["Introdução ao BDD", "Escrita de cenários em Gherkin", "Integração entre Cucumber e Selenium", "Organização de steps", "Integração com Page Objects"],
    tools: ["Java", "Selenium", "Cucumber"],
  },
  {
    number: "09",
    title: "Automação com Banco de Dados",
    description: "",
    content: ["Conexão com banco de dados", "Validação de dados em testes automatizados", "Consultas SQL para validação de testes"],
    tools: [],
  },
  {
    number: "10",
    title: "Integração com CI/CD",
    description: "",
    content: ["Introdução a CI/CD", "Execução automática de testes", "Integração com Jenkins"],
    tools: ["Jenkins", "GitHub"],
  },
  {
    number: "11",
    title: "Automação com Cypress",
    description: "",
    content: ["Estrutura de testes com Cypress", "Testes end-to-end", "Integração com banco de dados", "Execução de testes em CI/CD"],
    tools: ["JavaScript", "Node.js", "Cypress", "GitHub Actions"],
  },
  {
    number: "12",
    title: "Automação com Playwright e CodeceptJS",
    description: "",
    content: ["Estrutura de automação", "Escrita de cenários automatizados", "Organização de projeto"],
    tools: ["Playwright", "CodeceptJS", "Node.js"],
  },
  {
    number: "13",
    title: "Testes Manuais de API",
    description: "",
    content: ["Introdução a APIs", "Métodos HTTP", "Estrutura de requisições", "Validação de respostas"],
    tools: ["Postman", "Swagger"],
  },
  {
    number: "14",
    title: "Automação de Testes de API",
    description: "",
    content: ["Automação de testes de API", "Validação de responses", "Estrutura de automação de API"],
    tools: ["RestAssured", "Java", "Cucumber"],
  },
];

const allTech = ["Java", "Selenium", "Cucumber", "RestAssured", "Cypress", "Playwright", "CodeceptJS", "JavaScript", "Node.js", "Jenkins", "GitHub", "GitHub Actions", "Postman", "Swagger", "Figma"];

interface CourseGridModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CourseGridModal({ open, onClose }: CourseGridModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#0f1628",
          border: "1px solid rgba(99,179,237,0.15)",
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          pt: 3,
          pb: 2,
          borderBottom: "1px solid rgba(99,179,237,0.08)",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "var(--font-syne, sans-serif)",
              fontWeight: 800,
              fontSize: "1.25rem",
              color: "#e2e8f0",
            }}
          >
            Grade do Curso —{" "}
            <Box component="span" sx={{ color: "#63b3ed" }}>
              CodeStation QA
            </Box>
          </Typography>
          <Typography variant="caption" sx={{ color: "#718096", fontFamily: "var(--font-jetbrains, monospace)" }}>
            14 módulos • +40h de conteúdo prático
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {modules.map((mod) => (
            <Box
              key={mod.number}
              sx={{
                border: "1px solid rgba(99,179,237,0.08)",
                borderRadius: 2,
                p: 2.5,
                backgroundColor: "#080c18",
                "&:hover": { borderColor: "rgba(99,179,237,0.2)" },
                transition: "border-color 0.2s",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 1 }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-jetbrains, monospace)",
                    fontSize: "0.7rem",
                    color: "#63b3ed",
                    backgroundColor: "rgba(99,179,237,0.08)",
                    border: "1px solid rgba(99,179,237,0.2)",
                    borderRadius: 1,
                    px: 1,
                    py: 0.25,
                    whiteSpace: "nowrap",
                    mt: 0.25,
                  }}
                >
                  M{mod.number}
                </Typography>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontFamily: "var(--font-syne, sans-serif)",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: "#e2e8f0",
                      lineHeight: 1.3,
                    }}
                  >
                    {mod.title}
                  </Typography>
                  {mod.description && (
                    <Typography variant="caption" sx={{ color: "#718096", display: "block", mt: 0.5 }}>
                      {mod.description}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box
                component="ul"
                sx={{ m: 0, pl: 2.5, display: "flex", flexDirection: "column", gap: 0.25 }}
              >
                {mod.content.map((item, i) => (
                  <Box
                    component="li"
                    key={i}
                    sx={{ color: "#718096", fontSize: "0.8rem", fontFamily: "var(--font-jetbrains, monospace)" }}
                  >
                    {item}
                  </Box>
                ))}
              </Box>

              {mod.tools.length > 0 && (
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.5 }}>
                  {mod.tools.map((tool) => (
                    <Chip
                      key={tool}
                      label={tool}
                      size="small"
                      icon={<CodeIcon sx={{ fontSize: "0.7rem !important" }} />}
                      sx={{
                        fontSize: "0.625rem",
                        height: 20,
                        backgroundColor: "rgba(183,148,244,0.08)",
                        border: "1px solid rgba(183,148,244,0.2)",
                        color: "#b794f4",
                        "& .MuiChip-icon": { color: "#b794f4" },
                      }}
                    />
                  ))}
                </Box>
              )}

            </Box>
          ))}

          <Divider sx={{ borderColor: "rgba(99,179,237,0.08)", my: 1 }} />

          <Box sx={{ p: 2.5, backgroundColor: "#080c18", border: "1px solid rgba(99,179,237,0.1)", borderRadius: 2 }}>
            <Typography
              sx={{
                fontFamily: "var(--font-syne, sans-serif)",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "#e2e8f0",
                mb: 1.5,
              }}
            >
              Tecnologias que você irá dominar
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              {allTech.map((tech) => (
                <Chip
                  key={tech}
                  label={tech}
                  size="small"
                  color="primary"
                />
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: "#718096", display: "block", mt: 2, fontFamily: "var(--font-jetbrains, monospace)" }}>
              // mais de 40 horas de conteúdo prático com ferramentas usadas no mercado de QA
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2.5,
              backgroundColor: "rgba(104,211,145,0.04)",
              border: "1px solid rgba(104,211,145,0.15)",
              borderRadius: 2,
            }}
          >
            <Typography
              sx={{
                fontFamily: "var(--font-syne, sans-serif)",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "#68d391",
                mb: 1,
              }}
            >
              Construção completa dos frameworks de automação
            </Typography>
            <Typography variant="body2" sx={{ color: "#718096", lineHeight: 1.8 }}>
              Os alunos constroem do zero todos os frameworks de automação trabalhados no curso —
              Selenium, Cypress, Playwright e RestAssured — aplicando boas práticas como Page Object Model,
              BDD com Cucumber e integração com CI/CD. O aprendizado é 100% prático, simulando o ambiente
              real de trabalho de uma equipe de QA.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
