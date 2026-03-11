import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ProvaService } from "@/services/prova/prova.service";

export async function GET(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const provas = await ProvaService.listarBackoffice();
    return NextResponse.json(provas);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao listar provas" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const prova = await ProvaService.criar(body);
    return NextResponse.json(prova, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar prova" },
      { status: 400 }
    );
  }
}