import prisma from "@/lib/prisma";
import { z } from "zod";
import { NextResponse } from "next/server";

const schema = z.object({
  email: z.string().email(),
  pin: z.string().length(6),
});

export async function POST(req: Request) {
  const body = await req.json();
  const { email, pin } = schema.parse(body);

  const record = await prisma.passwordReset.findFirst({
    where: { email, pin, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Código inválido ou expirado" },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "PIN válido" });
}
