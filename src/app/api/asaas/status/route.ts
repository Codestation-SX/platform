import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { apiAsaas } from "@/lib/asaas";
import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const userId = token.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.asaasCustomerId) {
      return NextResponse.json(
        { error: "Cliente Asaas não encontrado" },
        { status: 400 }
      );
    }

    let payment = await prisma.payment.findUnique({
      where: { userId },
    });

    let status: string = "PENDING";
    let invoiceUrl = "";
    let shouldCreateNew = false;

    // Se já existe uma cobrança
    if (payment?.asaasInvoiceId) {
      try {
        const res = await apiAsaas.get(`/payments/${payment.asaasInvoiceId}`);
        const paymentData = res.data;

        status = paymentData.status; // PENDING, PAID, etc.
        invoiceUrl = paymentData.invoiceUrl;
        const expired = dayjs(paymentData.dueDate).isBefore(dayjs());

        if (paymentData.status === "CANCELLED" || expired) {
          shouldCreateNew = true;
        }
      } catch (err) {
        console.error("Erro ao buscar status no Asaas", err);
        shouldCreateNew = true;
      }
    } else {
      shouldCreateNew = true;
    }

    // Se precisar criar nova cobrança
    if (shouldCreateNew) {
      const dueDate = dayjs().add(3, "days").format("YYYY-MM-DD");

      const createRes = await apiAsaas.post("/payments", {
        customer: user.asaasCustomerId,
        billingType: "UNDEFINED", // o Asaas oferece todos: Pix, boleto e cartão
        value: 109.9,
        dueDate,
        installmentCount: 12, // para parcelamento
      });

      const newPayment = createRes.data;

      // Atualiza no banco
      if (payment) {
        payment = await prisma.payment.update({
          where: { id: payment.id },
          data: {
            asaasInvoiceId: newPayment.id,
            status: "PENDING",
            dueDate: new Date(newPayment.dueDate),
          },
        });
      } else {
        payment = await prisma.payment.create({
          data: {
            userId,
            asaasInvoiceId: newPayment.id,
            value: newPayment.value,
            status: "PENDING",
            dueDate: new Date(newPayment.dueDate),
          },
        });
      }

      invoiceUrl = newPayment.invoiceUrl;
      status = "PENDING";
    }

    const contract = await prisma.contract.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      data: {
        status,
        invoiceUrl,
        contractUrl: contract?.fileUrl || "",
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao buscar ou criar cobrança" },
      { status: 500 }
    );
  }
}
