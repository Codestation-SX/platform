import { jsPDF } from "jspdf";

interface CertificadoData {
  nomeAluno: string;
  nomeTurma: string;
  emitidoEm: string;
}

// Paleta fiel ao modelo
const PURPLE = [27, 20, 100] as [number, number, number];
const GOLD   = [197, 160, 40] as [number, number, number];
const GOLD_L = [230, 195, 80] as [number, number, number];
const DARK   = [30, 25, 80]   as [number, number, number];
const GRAY   = [100, 100, 120] as [number, number, number];
const WHITE  = [255, 255, 255] as [number, number, number];

/** Desenha a medalha usando apenas círculos (compatível com jsPDF) */
function desenharMedalha(doc: jsPDF, cx: number, cy: number) {
  // Raios em forma de sol: círculos menores em volta do grande
  const dentes = 14;
  const rBase  = 19;
  const rDente = 3.2;
  doc.setFillColor(...GOLD);
  for (let i = 0; i < dentes; i++) {
    const ang = (i * 2 * Math.PI) / dentes;
    const dx = (rBase + rDente * 0.6) * Math.cos(ang);
    const dy = (rBase + rDente * 0.6) * Math.sin(ang);
    doc.circle(cx + dx, cy + dy, rDente, "F");
  }

  // Anel dourado externo
  doc.setFillColor(...GOLD);
  doc.circle(cx, cy, rBase, "F");

  // Anel dourado claro interno
  doc.setFillColor(...GOLD_L);
  doc.circle(cx, cy, 15.5, "F");

  // Anel dourado médio
  doc.setFillColor(...GOLD);
  doc.circle(cx, cy, 13, "F");

  // Centro roxo
  doc.setFillColor(...PURPLE);
  doc.circle(cx, cy, 10.5, "F");

  // Texto na medalha (fonte padrão — sem Unicode)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(4.2);
  doc.setTextColor(...GOLD_L);
  doc.text("CODESTATION", cx, cy - 1.5, { align: "center" });

  doc.setFontSize(7);
  doc.text("* * *", cx, cy + 5, { align: "center" });
}

export function gerarCertificadoPDF(data: CertificadoData): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // ── Fundo branco ─────────────────────────────────────────────────────────────
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, H, "F");

  // ── Borda externa grossa roxa ────────────────────────────────────────────────
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(6);
  doc.rect(6, 6, W - 12, H - 12);

  // ── Borda interna fina ───────────────────────────────────────────────────────
  doc.setDrawColor(60, 40, 130);
  doc.setLineWidth(0.8);
  doc.rect(12, 12, W - 24, H - 24);

  // ── Medalha (canto superior direito) ─────────────────────────────────────────
  desenharMedalha(doc, 257, 40);

  // ── Cabeçalho ────────────────────────────────────────────────────────────────
  const cx = 133; // centro horizontal excluindo medalha

  doc.setFont("helvetica", "bold");
  doc.setFontSize(34);
  doc.setTextColor(...PURPLE);
  doc.text("CODESTATION", cx, 31, { align: "center" });

  doc.setFontSize(13);
  doc.text("CERTIFICADO DE CONCLUSAO", cx, 43, { align: "center" });

  // ── "Concedido a" ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(...GRAY);
  doc.text("Concedido a", W / 2, 64, { align: "center" });

  // ── Nome do aluno ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...DARK);
  doc.text(data.nomeAluno, W / 2, 80, { align: "center" });

  // Linha decorativa sob o nome
  const nw = Math.min(doc.getTextWidth(data.nomeAluno) + 16, W - 60);
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - nw / 2, 84, W / 2 + nw / 2, 84);

  // ── Descrição (quebra automática de linha) ───────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);

  const descricao =
    "Por  ter concluido com  aproveitamento total  o curso Técnico em Qualidade de Software,  em torno de 4 meses, contendo aulas online, exercícios práticos  e mentoria ao vivo";

  const linhas = doc.splitTextToSize(descricao, 220) as string[];
  const alturaLinha = 9; // espaçamento entre linhas em mm
  linhas.forEach((linha: string, i: number) => {
    doc.text(linha, W / 2, 98 + i * alturaLinha, { align: "center" });
  });

  // ── Data de emissão ───────────────────────────────────────────────────────────
  const dataFormatada = new Date(data.emitidoEm).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  doc.text(`Data de Emissao: ${dataFormatada}`, W / 2, 133, { align: "center" });

  // ── CNPJ (rodapé esquerdo) ────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PURPLE);
  doc.text("CODESTATION CNPJ 61.342.876/0001-00", 20, 185);

  // ── Assinatura (rodapé direito) ───────────────────────────────────────────────
  const sigCx = 237;

  // Texto cursivo (itálico simula assinatura)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(12);
  doc.setTextColor(...DARK);
  doc.text("Samuel Xavier Rodrigues Silva", sigCx, 174, { align: "center" });

  // Linha
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.4);
  doc.line(sigCx - 38, 177, sigCx + 38, 177);

  // Cargo abaixo da linha
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Diretor Responsavel", sigCx, 183, { align: "center" });

  // ── Download ──────────────────────────────────────────────────────────────────
  const arquivo = `certificado_${data.nomeAluno.replace(/\s+/g, "_").toLowerCase()}.pdf`;
  doc.save(arquivo);
}
