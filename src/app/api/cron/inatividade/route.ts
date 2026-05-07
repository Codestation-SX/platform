import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Envia mensagem WhatsApp via Z-API
async function enviarWhatsApp(phone: string, mensagem: string): Promise<boolean> {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  if (!instanceId || !token) return false;

  // Normaliza o número: remove tudo que não é dígito, adiciona 55 se necessário
  let numero = phone.replace(/\D/g, "");
  if (!numero.startsWith("55")) numero = "55" + numero;

  try {
    const res = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(clientToken ? { "Client-Token": clientToken } : {}),
        },
        body: JSON.stringify({ phone: numero, message: mensagem }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

// GET /api/cron/inatividade
// Chamado diariamente — envia WhatsApp para alunos inativos há exatamente 3 dias
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agora = new Date();
  // Janela: entre 3 dias e 4 dias atrás (para não reenviar todo dia)
  const tresDiasAtras = new Date(agora.getTime() - 3 * 24 * 60 * 60 * 1000);
  const quatroDiasAtras = new Date(agora.getTime() - 4 * 24 * 60 * 60 * 1000);

  const alunos = await prisma.user.findMany({
    where: {
      deletedAt: null,
      role: "student",
      ativo: true,
      phone: { not: null },
      lastLoginAt: {
        gte: quatroDiasAtras,
        lt: tresDiasAtras,
      },
    },
    select: {
      id: true,
      firstName: true,
      phone: true,
    },
  });

  const resultados: { id: string; nome: string; enviado: boolean }[] = [];

  for (const aluno of alunos) {
    if (!aluno.phone) continue;

    const mensagem =
      `Olá, ${aluno.firstName}! 👋\n\n` +
      `Sentimos sua falta! Faz 3 dias que você não acessa a plataforma Codestation.\n\n` +
      `Continue seus estudos e não perca o ritmo! 🚀\n\n` +
      `Acesse agora: https://codestattion.com.br`;

    const enviado = await enviarWhatsApp(aluno.phone, mensagem);
    resultados.push({ id: aluno.id, nome: aluno.firstName, enviado });
  }

  return NextResponse.json({
    processados: alunos.length,
    resultados,
  });
}
