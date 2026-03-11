import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ProvaService } from "@/services/prova/prova.service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: Params) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const prova = await ProvaService.obterPorId(id);

    if (!prova) {
      return NextResponse.json(
        { error: "Prova não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(prova);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar prova" },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request, { params }: Params) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const prova = await ProvaService.atualizar(id, body);
    return NextResponse.json(prova);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar prova" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request, { params }: Params) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await ProvaService.excluir(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao excluir prova" },
      { status: 400 }
    );
  }
}