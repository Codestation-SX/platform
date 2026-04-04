import { jsPDF } from "jspdf";

interface CertificadoData {
  nomeAluno: string;
  cpf?: string;
  email?: string;
  dataNascimento?: string;
  cidade?: string;
  estado?: string;
  nomeTurma: string;
  emitidoEm: string;
  certificadoId?: string;
}

const PURPLE = [27, 20, 100] as [number, number, number];
const GOLD   = [197, 160, 40] as [number, number, number];
const GOLD_L = [230, 195, 80] as [number, number, number];
const DARK   = [30, 25, 80]   as [number, number, number];
const GRAY   = [100, 100, 120] as [number, number, number];
const WHITE  = [255, 255, 255] as [number, number, number];

function desenharSelo(doc: jsPDF, cx: number, cy: number) {
  const dentes = 16;
  const rBase  = 21;
  const rDente = 3.4;
  doc.setFillColor(...GOLD);
  for (let i = 0; i < dentes; i++) {
    const ang = (i * 2 * Math.PI) / dentes;
    const dx = (rBase + rDente * 0.6) * Math.cos(ang);
    const dy = (rBase + rDente * 0.6) * Math.sin(ang);
    doc.circle(cx + dx, cy + dy, rDente, "F");
  }
  doc.setFillColor(...GOLD);
  doc.circle(cx, cy, rBase, "F");
  doc.setFillColor(...GOLD_L);
  doc.circle(cx, cy, 16.5, "F");
  doc.setFillColor(...GOLD);
  doc.circle(cx, cy, 14, "F");
  doc.setFillColor(...PURPLE);
  doc.circle(cx, cy, 11.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(3.8);
  doc.setTextColor(...GOLD_L);
  doc.text("CODESTATION", cx, cy - 1.5, { align: "center" });
  doc.setFontSize(6.5);
  doc.text("* * *", cx, cy + 4.5, { align: "center" });
}

export function gerarCertificadoPDF(data: CertificadoData): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;

  // ── Fundo branco ──────────────────────────────────────────────────────────────
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, H, "F");

  // ── Borda externa grossa roxa ─────────────────────────────────────────────────
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(7);
  doc.rect(4, 4, W - 8, H - 8);

  // ── Borda interna fina roxa ───────────────────────────────────────────────────
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, W - 20, H - 20);

  // ── Borda dourada ─────────────────────────────────────────────────────────────
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.4);
  doc.rect(13, 13, W - 26, H - 26);

  // ── Ornamentos nos cantos ─────────────────────────────────────────────────────
  doc.setFillColor(...GOLD);
  ([ [10,10], [287,10], [10,200], [287,200] ] as [number,number][]).forEach(([x, y]) => {
    doc.rect(x - 2.5, y - 2.5, 5, 5, "F");
  });

  // ── Selo (canto superior esquerdo) ────────────────────────────────────────────
  desenharSelo(doc, 40, 34);

  // ── Cabeçalho (à direita do selo) ─────────────────────────────────────────────
  const headerCx = (W + 68) / 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(30);
  doc.setTextColor(...PURPLE);
  doc.text("CODESTATION", headerCx, 27, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...GRAY);
  doc.text("ESCOLA DE PROGRAMAÇÃO E TECNOLOGIA", headerCx, 36, { align: "center" });

  // ── Linha divisória dourada ───────────────────────────────────────────────────
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(18, 45, W - 18, 45);

  // ── Texto principal ───────────────────────────────────────────────────────────
  const cx = W / 2;

  const dataFormatada = data.emitidoEm
    ? new Date(data.emitidoEm).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  doc.setFont("times", "italic");
  doc.setFontSize(10.5);
  doc.setTextColor(...DARK);
  doc.text(
    "A Codestation Escola de Programação e Tecnologia, no uso de suas atribuições, e tendo em vista",
    cx, 55, { align: "center" }
  );
  doc.text(
    `a conclusão do ${data.nomeTurma} em ${dataFormatada}, confere o título de`,
    cx, 63, { align: "center" }
  );

  // ── Nome do curso ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...PURPLE);
  doc.text(data.nomeTurma.toUpperCase(), cx, 73, { align: "center" });

  // ── Conector "a" ──────────────────────────────────────────────────────────────
  doc.setFont("times", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text("a", cx, 81, { align: "center" });

  // ── Nome do aluno ─────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...DARK);
  doc.text(data.nomeAluno.toUpperCase(), cx, 94, { align: "center" });

  // Linha sob o nome
  const nw = Math.min(doc.getTextWidth(data.nomeAluno.toUpperCase()) + 12, W - 60);
  doc.setDrawColor(...GRAY);
  doc.setLineWidth(0.4);
  doc.line(cx - nw / 2, 97, cx + nw / 2, 97);

  // ── Detalhes do aluno ─────────────────────────────────────────────────────────
  const partes: string[] = [];
  if (data.cidade && data.estado) partes.push(`natural de ${data.cidade} — ${data.estado}`);
  if (data.dataNascimento) {
    const nasc = new Date(data.dataNascimento).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    partes.push(`nascido(a) em ${nasc}`);
  }
  if (data.cpf) partes.push(`portador(a) do CPF nº ${data.cpf}`);
  if (data.email) partes.push(`e-mail ${data.email}`);

  let yPos = 105;
  if (partes.length > 0) {
    const detalhesTexto = "de " + partes.join(", ");
    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...GRAY);
    const linhas = doc.splitTextToSize(detalhesTexto, 230) as string[];
    linhas.forEach((linha, i) => {
      doc.text(linha, cx, yPos + i * 7, { align: "center" });
    });
    yPos += linhas.length * 7 + 3;
  }

  // ── Texto de encerramento ─────────────────────────────────────────────────────
  doc.setFont("times", "italic");
  doc.setFontSize(10.5);
  doc.setTextColor(...DARK);
  doc.text("e outorga-lhe o presente Certificado de Conclusão,", cx, yPos + 2, { align: "center" });
  doc.text("a fim de que possa gozar de todos os direitos e prerrogativas legais.", cx, yPos + 9, { align: "center" });

  // ── Cidade e data ─────────────────────────────────────────────────────────────
  const yCidade = yPos + 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`São Paulo, ${dataFormatada}.`, cx, yCidade, { align: "center" });

  // ── Área de assinaturas ───────────────────────────────────────────────────────
  const yLinha = Math.min(yCidade + 20, 172);

  // Assinatura esquerda — Instituição
  const leftCx = 70;
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.4);
  doc.line(leftCx - 40, yLinha, leftCx + 40, yLinha);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...PURPLE);
  doc.text("CODESTATION", leftCx, yLinha + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text("CNPJ 61.342.876/0001-00", leftCx, yLinha + 12, { align: "center" });
  doc.text("Escola de Programação e Tecnologia", leftCx, yLinha + 17, { align: "center" });

  // Assinatura direita — Diretor
  const rightCx = 227;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text("Samuel Xavier Rodrigues Silva", rightCx, yLinha - 4, { align: "center" });

  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.4);
  doc.line(rightCx - 40, yLinha, rightCx + 40, yLinha);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text("Diretor Responsável", rightCx, yLinha + 6, { align: "center" });

  // ── Código de validação ───────────────────────────────────────────────────────
  if (data.certificadoId) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.text("Código de Validação", rightCx, yLinha + 13, { align: "center" });
    doc.text(data.certificadoId, rightCx, yLinha + 18, { align: "center" });
  }

  // ── Download ──────────────────────────────────────────────────────────────────
  const arquivo = `certificado_${data.nomeAluno.replace(/\s+/g, "_").toLowerCase()}.pdf`;
  doc.save(arquivo);
}
