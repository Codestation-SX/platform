// src/utils/api/sorting.ts

export function parseSortParams(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField = "createdAt",
  defaultOrder: "asc" | "desc" = "desc"
): Record<string, "asc" | "desc"> {
  const sortBy = searchParams.get("sortBy") || defaultField;
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const safeSortBy = allowedFields.includes(sortBy) ? sortBy : defaultField;
  return { [safeSortBy]: sortOrder };
}

// Exemplo de uso na API:
// import { parseSortParams } from "@/utils/api/sorting";
// const orderBy = parseSortParams(searchParams, ["title", "createdAt"]);
// const result = await prisma.unit.findMany({ orderBy, ... });
