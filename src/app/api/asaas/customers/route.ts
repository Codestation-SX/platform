// /app/api/asaas/customers/route.ts
import { NextResponse } from "next/server";
import { findOrCreateCustomer } from "@/services/asaas/findOrCreateCustomer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(body);
    const response = await findOrCreateCustomer({
      firstName: body.name,
      lastName: body.lastName,
      address: body.address,
      cpf: body.cpf,
      email: body.email,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error(
      "Erro ao criar cliente no Asaas",
      error?.response?.data || error
    );

    return NextResponse.json(
      { error: "Erro ao criar cliente no Asaas" },
      { status: 500 }
    );
  }
}
