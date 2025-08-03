// app/api/asaas/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const mapStatus = (
  asaasStatus: string
): "PENDING" | "PAID" | "FAILED" | "CANCELLED" => {
  switch (asaasStatus) {
    case "RECEIVED":
    case "CONFIRMED":
      return "PAID";
    case "OVERDUE":
    case "FAILED":
      return "FAILED";
    case "CANCELLED":
      return "CANCELLED";
    default:
      return "PENDING";
  }
};

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("asaas-access-token");
    if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const payload = await req.json();
    const { id: eventId, event, payment } = payload;

    if (!eventId || !event || !payment?.id) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    // 1. Registrar o evento (com idempotência via chave única)
    try {
      await prisma.webhookEvent.create({
        data: {
          eventId,
          eventType: event,
          payload,
        },
      });
    } catch (err) {
      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        // Evento duplicado — já tratado
        return NextResponse.json({ received: true, duplicated: true });
      }
      throw err;
    }

    // 2. Atualizar o status do pagamento (se aplicável)
    const newStatus = mapStatus(payment.status);

    await prisma.payment.update({
      where: { asaasInvoiceId: payment.id },
      data: { status: newStatus },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Erro no webhook do Asaas:", err);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
