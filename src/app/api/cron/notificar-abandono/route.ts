import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { resend, ADMIN_EMAIL, FROM_EMAIL } from "@/lib/resend";

// Cron job: notifica admin sobre alunos que abandonaram na tela de pagamento
// Execute periodicamente (ex: a cada hora via cron externo com Bearer CRON_SECRET)
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Alunos cadastrados há mais de 2 horas sem pagamento confirmado
  const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000);

  const alunos = await prisma.user.findMany({
    where: {
      role: "student",
      deletedAt: null,
      createdAt: { lte: duasHorasAtras },
      OR: [
        { payment: null },
        { payment: { status: { not: "PAID" } } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      cpf: true,
      createdAt: true,
      payment: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (alunos.length === 0) {
    return NextResponse.json({ message: "Nenhum abandono para notificar" });
  }

  const linhas = alunos
    .map(
      (a) =>
        `<tr>
          <td>${a.firstName} ${a.lastName}</td>
          <td>${a.email}</td>
          <td>${a.cpf}</td>
          <td>${new Date(a.createdAt).toLocaleString("pt-BR")}</td>
          <td>${a.payment?.status ?? "SEM PAGAMENTO"}</td>
        </tr>`
    )
    .join("");

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `${alunos.length} aluno(s) com matrícula pendente — Codestation`,
      html: `
        <h2>Alunos com pagamento pendente</h2>
        <p>Os seguintes alunos preencheram o formulário de matrícula mas ainda não concluíram o pagamento:</p>
        <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">
          <thead>
            <tr>
              <th>Nome</th><th>E-mail</th><th>CPF</th><th>Cadastrado em</th><th>Status</th>
            </tr>
          </thead>
          <tbody>${linhas}</tbody>
        </table>
        <br/>
        <a href="https://www.eadcodestation.com.br/backoffice/matriculas-pendentes">
          Ver no backoffice
        </a>
      `,
    });
  } catch (emailErr) {
    console.error("Erro ao enviar email de abandono:", emailErr);
    return NextResponse.json({ error: "Erro ao enviar email" }, { status: 500 });
  }

  return NextResponse.json({ message: `${alunos.length} notificação(ões) enviada(s)` });
}
