// lib/mail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, pin: string) {
  try {
    await resend.emails.send({
      from: "CodeStation <no-reply@henrique.csouzza@gmail.com>",
      to: email,
      subject: "Código para redefinição de senha",
      html: `
        <h2>Redefinição de senha</h2>
        <p>Você solicitou a redefinição da sua senha. Use o código abaixo:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${pin}</p>
        <p>O código expira em 15 minutos.</p>
        <p>Se não foi você, ignore este e-mail.</p>
      `,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error("Falha ao enviar e-mail de redefinição de senha");
  }
}
