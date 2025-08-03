// src/utils/handleApiError.ts
import { enqueueSnackbar } from "notistack";

export function handleApiClientError(error: any): string {
  if (error?.response?.data) {
    const { error: message, issues } = error.response.data;

    // Erros de validação (Zod)
    if (Array.isArray(issues)) {
      const issuesMessage = issues
        .map((i: any) => {
          const field =
            Array.isArray(i.path) && i.path.length > 0
              ? i.path.join(".")
              : "Campo";
          return `${field}: ${i.message}`;
        })
        .join(" | ");

      enqueueSnackbar(issuesMessage, {
        variant: "error",
      });
      return issuesMessage;
    }

    // Mensagem padrão
    if (typeof message === "string") {
      enqueueSnackbar(message, { variant: "error" });
      return message;
    }
  }

  if (error?.message) {
    enqueueSnackbar(error.message, { variant: "error" });
    return error.message;
  }

  enqueueSnackbar("Erro inesperado. Tente novamente.", { variant: "error" });
  return "Erro inesperado. Tente novamente.";
}
