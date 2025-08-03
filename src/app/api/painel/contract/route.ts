// /app/api/painel/contract/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contract = await prisma.contract.findUnique({
    where: { userId: token.id },
  });

  return NextResponse.json({ contract });
}

export async function PUT(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.role !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.contract.update({
    where: { userId: token.id },
    data: {
      isSigned: true,
      signedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
