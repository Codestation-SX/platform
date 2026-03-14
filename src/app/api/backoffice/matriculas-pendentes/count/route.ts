import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token || token.role !== "admin") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const count = await prisma.user.count({
    where: {
      role: "student",
      deletedAt: null,
      OR: [
        { payment: null },
        { payment: { status: { not: "PAID" } } },
      ],
    },
  });

  return NextResponse.json({ count });
}
