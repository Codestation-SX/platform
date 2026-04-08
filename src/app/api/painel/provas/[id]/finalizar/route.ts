import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ProvaService } from "@/services/prova/prova.service";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(req: Request, { params }: Params) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const resultado = await ProvaService.finalizarTentativa(
      id,
      token.sub,
      body.respostas ?? [],
      body.fraudeDetectada ?? false,
      body.motivoFraude
    );

    // ✅ verifica se deve encerrar a prova automaticamente
    await ProvaService.verificarEEncerrarProva(id);

    return NextResponse.json(resultado);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao finalizar prova" },
      { status: 400 }
    );
  }
}