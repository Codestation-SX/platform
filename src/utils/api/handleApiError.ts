import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { isAxiosError } from "axios";

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

  // Erros HTTP externos (ex: Asaas API) via Axios
  if (isAxiosError(error)) {
    const status = error.response?.status ?? 502;
    const asaasErrors = error.response?.data?.errors;
    const asaasMessage =
      Array.isArray(asaasErrors) && asaasErrors.length > 0
        ? asaasErrors.map((e: any) => e.description).join("; ")
        : error.response?.data?.message || error.message;

    console.error("[Asaas] Erro HTTP", status, error.response?.data);
    return NextResponse.json(
      { error: asaasMessage || "Erro na integração com gateway de pagamento" },
      { status: status >= 500 ? 502 : status }
    );
  }

  console.error("[handleApiError]", error);
  return NextResponse.json(
    {
      error: "Erro interno do servidor",
      message: (error as Error)?.message || "Erro desconhecido",
    },
    { status: 500 }
  );
}
