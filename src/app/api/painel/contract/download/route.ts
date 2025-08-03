// /api/painel/contract/download
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "student") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id },
    include: { address: true },
  });

  if (!user || !user.address) {
    return new NextResponse("User or address not found", { status: 404 });
  }

  // Cria o PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const drawText = (text: string, y: number) => {
    page.drawText(text, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    });
  };

  let y = height - 50;
  drawText("Contrato de Prestação de Serviços Educacionais", y);
  y -= 40;

  drawText(`Aluno: ${user.firstName} ${user.lastName}`, (y -= 20));
  drawText(`CPF: ${user.cpf} - RG: ${user.rg}`, (y -= 20));
  drawText(
    `Nascimento: ${user.birthDate?.toLocaleDateString("pt-BR")}`,
    (y -= 20)
  );

  y -= 20;
  drawText("Endereço:", (y -= 20));
  drawText(
    `${user.address.street}, ${user.address.number} - ${user.address.neighborhood}`,
    (y -= 20)
  );
  drawText(
    `${user.address.city} - ${user.address.state}, CEP ${user.address.zipCode}`,
    (y -= 20)
  );

  y -= 40;
  drawText(
    "Cláusula 1: O aluno compromete-se a seguir as regras da plataforma...",
    y
  );
  drawText(
    "Cláusula 2: O curso será disponibilizado mediante pagamento...",
    (y -= 20)
  );

  // Gera buffer
  const pdfBytes = await pdfDoc.save();

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=contrato.pdf",
    },
  });
}
