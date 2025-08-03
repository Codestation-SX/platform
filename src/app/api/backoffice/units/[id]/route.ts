import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateAdminAccess } from "@/utils/validateAdminAccess";
import { handleApiError } from "@/utils/api/handleApiError";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!id || typeof id !== "string" || id.trim() === "") {
    return NextResponse.json(
      { error: "ID inválido ou ausente." },
      { status: 400 }
    );
  }

  const authorized = await validateAdminAccess(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const unit = await prisma.unit.findFirst({
      where: { id, deletedAt: null },
      include: {
        lessons: { where: { deletedAt: null }, orderBy: { order: "asc" } },
      },
    });

    if (!unit) {
      return NextResponse.json(
        { error: "Unidade não encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error("[GET /api/backoffice/units/[id]]", error);
    return handleApiError(error);
  }
}
