// src/app/api/backoffice/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateAdminAccess } from "@/utils/validateAdminAccess";
import { z } from "zod";
import { formatPaginatedResponse } from "@/utils/api/pagination";
import { handleApiError } from "@/utils/api/handleApiError";
import { parseSortParams } from "@/utils/api/sorting";

const lessonSchema = z.object({
  title: z.string().min(1),
  videoUrl: z.string().url(),
  duration: z.number().int().positive(),
  isFree: z.boolean(),
  unitId: z.string().min(1),
});

const updateSchema = lessonSchema.extend({
  id: z.string().min(1),
  order: z.number().int().positive().optional(),
});

export async function POST(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = lessonSchema.parse(body);

    const lastLesson = await prisma.lesson.findFirst({
      where: { deletedAt: null, unitId: data.unitId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastLesson ? lastLesson.order + 1 : 1;

    const lesson = await prisma.lesson.create({
      data: {
        ...data,
        order: nextOrder,
      },
    });

    return NextResponse.json(lesson);
  } catch (error) {
    console.error("[POST /api/backoffice/lessons]", error);
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const whereClause = { deletedAt: null, ...(unitId ? { unitId } : {}) };
    const orderBy = parseSortParams(searchParams, ["title", "createdAt"]);
    const lessons = await prisma.lesson.findMany({
      where: whereClause,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.lesson.count({ where: whereClause });

    return NextResponse.json(
      formatPaginatedResponse(lessons, total, page, limit)
    );
  } catch (error) {
    console.error("[GET /api/backoffice/lessons]", error);
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  console.log();
  const authorized = await validateAdminAccess(req);
  if (!authorized)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const updated = await prisma.lesson.update({
      where: { id: data.id },
      data: { ...data },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PUT /api/backoffice/lessons]", error);
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
        { error: "ID da aula é obrigatório" },
        { status: 400 }
      );
    }

    await prisma.lesson.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/backoffice/lessons]", error);
    return handleApiError(error);
  }
}
