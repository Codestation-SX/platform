// lib/mail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail({
  email,
  pin,
}: {
  email: string;
  pin: string;
}) {
  try {
    await resend.emails.send({
      from: "CodeStation <noreply@eadcodestation.com.br>",
      to: email,
      subject: "Código para redefinição de senha",
      html: `
        <div>
      <h2>Olá, ${email}!</h2>
      <p>Você solicitou uma redefinição de senha na plataforma da CodeStation.</p>
      <p>Insira o código abaixo na página de recuperação:</p>
      <h1 style={{ fontSize: '32px', margin: '20px 0' }}>${pin}</h1>
      <p>Este código é válido por 10 minutos.</p>
    </div>
      `,
    });
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error);
    throw new Error("Falha ao enviar e-mail de redefinição de senha");
  }
}
