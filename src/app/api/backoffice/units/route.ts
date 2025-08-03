// src/app/api/backoffice/units/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateAdminAccess } from "@/utils/validateAdminAccess";
import { z } from "zod";
import { formatPaginatedResponse } from "@/utils/api/pagination";
import { handleApiError } from "@/utils/api/handleApiError";
import { parseSortParams } from "@/utils/api/sorting";

const unitSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const updateSchema = unitSchema.extend({
  id: z.string().min(1),
  order: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = unitSchema?.parse(body);

    const lastUnit = await prisma.unit.findFirst({
      where: { deletedAt: null },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastUnit ? lastUnit.order + 1 : 1;

    const unit = await prisma.unit.create({
      data: {
        ...data,
        order: nextOrder,
      },
    });

    return NextResponse.json(unit);
  } catch (error) {
    console.error("[POST /api/backoffice/units]", error);
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const orderBy = parseSortParams(searchParams, ["title", "createdAt"]);
    const units = await prisma.unit.findMany({
      where: { deletedAt: null },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        lessons: { where: { deletedAt: null }, orderBy: { order: "asc" } },
      },
    });

    const total = await prisma.unit.count({ where: { deletedAt: null } });

    return NextResponse.json(
      formatPaginatedResponse(units, total, page, limit)
    );
  } catch (error) {
    console.error("[GET /api/backoffice/units]", error);
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = updateSchema?.parse(body);

    const updated = await prisma.unit.update({
      where: { id: data.id },
      data: { ...data },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/backoffice/units]", error);
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID da unidade é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.unit.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/backoffice/units]", error);
    return handleApiError(error);
  }
}
