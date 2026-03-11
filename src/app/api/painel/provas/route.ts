import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { ProvaService } from "@/services/prova/prova.service";

export async function GET(req: Request) {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.sub) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
   const provas = await ProvaService.listarDisponiveisParaAluno(token.sub); // ← passa o id do aluno
    return NextResponse.json(provas);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao listar provas disponíveis" },
      { status: 500 }
    );
  }
}