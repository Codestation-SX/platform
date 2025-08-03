import { Prisma } from "@/generated/prisma";

export function parseFilters<T extends Record<string, any>>(
  searchParams: URLSearchParams
): Prisma.Enumerable<Prisma.UserWhereInput> {
  const where: T = {} as T;

  searchParams.forEach((value, key) => {
    if (key.startsWith("filter_")) {
      const field = key.replace("filter_", "");
      const operator = searchParams.get(`operator_${field}`) || "contains";

      switch (operator) {
        case "equals":
          (where as any)[field] = { equals: value };
          break;
        case "startsWith":
          (where as any)[field] = { startsWith: value };
          break;
        case "endsWith":
          (where as any)[field] = { endsWith: value };
          break;
        case "contains":
        default:
          (where as any)[field] = { contains: value };
          break;
      }
    }
  });

  return where;
}
