import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Erro de validação",
        issues: error.issues.map((i) => ({
          path: i.path,
          message: i.message,
        })),
      },
      { status: 422 }
    );
  }

  if (error instanceof PrismaClientKnownRequestError) {
    return NextResponse.json(
      { error: `Erro no banco de dados: ${error.message}` },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      error: "Erro interno do servidor",
      message: (error as Error)?.message || "Erro desconhecido",
    },
    { status: 500 }
  );
}
