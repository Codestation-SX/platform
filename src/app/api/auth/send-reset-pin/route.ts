import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { z } from "zod";
import { NextResponse } from "next/server";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.passwordReset.create({
      data: { email, pin, expiresAt },
    });

    await sendPasswordResetEmail({ email, pin }); // você implementa isso com Resend, MailerSend, etc.

    return NextResponse.json({ message: "Código enviado para o e-mail" });
  } catch (err) {
    return NextResponse.json(
      { error: "Ocorreu um erro", response: err },
      { status: 400 }
    );
  }
}
