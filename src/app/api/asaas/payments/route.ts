// /app/api/asaas/payments/route.ts
import { NextRequest, NextResponse } from "next/server";
import { apiAsaas } from "@/lib/asaas";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const response = await apiAsaas.post("/payments", {
      customer: body.customerId,
      billingType: body.billingType, // BOLETO, CREDIT_CARD, PIX
      value: body.value,
      dueDate: body.dueDate,
      description: body.description,
      externalReference: body.externalReference, // opcional
      installmentCount: body.installmentCount, // para parcelamento
    });
    console.log(response);
    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error(
      "Erro ao criar pagamento no Asaas",
      error?.response?.data || error
    );
    return NextResponse.json(
      { error: "Erro ao criar pagamento no Asaas" },
      { status: 500 }
    );
  }
}
