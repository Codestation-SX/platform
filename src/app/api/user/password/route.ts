// app/api/user/password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getToken } from "next-auth/jwt";

const schema = z.object({
  password: z.string().min(6),
});

export async function PUT(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.id) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json();
  const parse = schema.safeParse(body);

  if (!parse.success) {
    return NextResponse.json(
      { error: "Senha inválida.", details: parse.error },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(parse.data.password, 10);

  try {
    await prisma.user.update({
      where: { id: token.id },
      data: { password: hashed },
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso." });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao alterar senha." },
      { status: 500 }
    );
  }
}
