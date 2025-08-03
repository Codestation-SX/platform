// src/app/api/backoffice/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validateAdminAccess } from "@/utils/validateAdminAccess";
import { z } from "zod";
import { formatPaginatedResponse } from "@/utils/api/pagination";
import { handleApiError } from "@/utils/api/handleApiError";
import { parseFilters } from "@/utils/api/parseFilters";
import { parseSortParams } from "@/utils/api/sorting";

const userSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  rg: z.string().min(5),
  cpf: z.string().min(11),
  birthDate: z.coerce.date(),
  educationLevel: z.string().min(1),
  role: z.enum(["student", "admin"]).optional(),
  address: z.object({
    zipCode: z.string().min(1, "CEP obrigatório"),
    state: z.string().min(1, "Estado obrigatório"),
    city: z.string().min(1, "Cidade obrigatória"),
    neighborhood: z.string().min(1, "Bairro obrigatório"),
    street: z.string().min(1, "Rua obrigatória"),
    number: z.string().min(1, "Número obrigatório"),
    complement: z.string().optional(),
  }),
});

const updateUserSchema = userSchema.partial().extend({
  id: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const authorized = await validateAdminAccess(req);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const filters = parseFilters(searchParams);
    const where = {
      deletedAt: null,
      ...filters,
    };
    const orderBy = parseSortParams(searchParams, ["title", "createdAt"]);
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        rg: true,
        cpf: true,
        birthDate: true,
        educationLevel: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({ where });

    return NextResponse.json(
      formatPaginatedResponse(users, total, page, limit)
    );
  } catch (error) {
    console.error("[GET /api/backoffice/users]", error);
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  const authorized = await validateAdminAccess(req);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = userSchema.parse(body);

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
        address: {
          create: data.address,
        },
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("[POST /api/backoffice/users]", error);
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  const authorized = await validateAdminAccess(req);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = updateUserSchema.parse(body);
    const { id, address, ...rest } = data;

    if (rest.password) {
      rest.password = await bcrypt.hash(rest.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...rest,
        ...(address && {
          address: {
            upsert: {
              update: {
                ...address,
              },
              create: {
                ...address,
              },
            },
          },
        }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[PUT /api/backoffice/users]", error);
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  const authorized = await validateAdminAccess(req);

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const protectedEmails = [
      "admcodestation@gmail.com",
      "henrique.csouzza@gmail.com",
    ];

    if (protectedEmails.includes(user.email)) {
      return NextResponse.json(
        { error: "Este usuário não pode ser excluído" },
        { status: 403 }
      );
    }

    const deletedUser = await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true, id: deletedUser.id });
  } catch (error) {
    console.error("[DELETE /api/backoffice/users]", error);
    return handleApiError(error);
  }
}
