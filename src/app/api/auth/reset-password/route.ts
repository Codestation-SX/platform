import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const schema = z.object({
  email: z.string().email(),
  pin: z.string().length(6),
  newPassword: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json();
  const { email, pin, newPassword } = schema.parse(body);

  const record = await prisma.passwordReset.findFirst({
    where: { email, pin, used: false },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "PIN inválido ou expirado" },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email },
    data: { password: hashed },
  });

  await prisma.passwordReset.update({
    where: { id: record.id },
    data: { used: true },
  });

  return NextResponse.json({ message: "Senha atualizada com sucesso" });
}
