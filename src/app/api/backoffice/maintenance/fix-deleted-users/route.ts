import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateAdminAccess } from "@/utils/validateAdminAccess";

export async function POST(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deleted = await prisma.user.findMany({
    where: { deletedAt: { not: null } },
    select: { id: true, email: true, cpf: true, asaasCustomerId: true },
  });

  let fixed = 0;
  for (const user of deleted) {
    const needsFix =
      !user.email.startsWith("deleted_") ||
      !user.cpf.startsWith("deleted_") ||
      user.asaasCustomerId !== null;

    if (needsFix) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: `deleted_${user.id}@deleted.invalid`,
          cpf: `deleted_${user.id}`,
          asaasCustomerId: null,
        },
      });
      fixed++;
    }
  }

  return NextResponse.json({ ok: true, fixed, total: deleted.length });
}
