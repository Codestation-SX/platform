// lib/mail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPaymentConfirmationEmail({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName: string;
  lastName: string;
}) {
  try {
    await resend.emails.send({
      from: "CodeStation <noreply@eadcodestation.com.br>",
      to: email,
      subject: "Pagamento confirmado - Bem-vindo à Codestation!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f9f9f9;">
          <div style="background-color: #0f1628; padding: 32px; border-radius: 12px; color: #ffffff;">
            <h1 style="color: #63b3ed; margin: 0 0 8px 0;">Codestation</h1>
            <p style="color: #a0aec0; margin: 0 0 32px 0;">Escola de Programação</p>

            <h2 style="margin: 0 0 16px 0;">Pagamento confirmado! ✅</h2>
            <p style="color: #e2e8f0; margin: 0 0 8px 0;">Olá, <strong>${firstName} ${lastName}</strong>!</p>
            <p style="color: #e2e8f0; margin: 0 0 24px 0;">
              Seu pagamento foi realizado com sucesso. Seja bem-vindo(a) à Codestation!
            </p>

            <div style="background-color: #1a2744; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #63b3ed; margin: 0 0 16px 0;">Seus dados de acesso</h3>
              <p style="color: #a0aec0; margin: 0 0 4px 0;">E-mail de login:</p>
              <p style="color: #ffffff; font-weight: bold; margin: 0 0 16px 0;">${email}</p>
              <p style="color: #a0aec0; margin: 0 0 4px 0;">Senha:</p>
              <p style="color: #ffffff; margin: 0;">A senha que você cadastrou no momento da matrícula.</p>
            </div>

            <a
              href="${process.env.NEXTAUTH_URL ?? "https://plataforma.eadcodestation.com.br"}/login"
              style="display: inline-block; background-color: #63b3ed; color: #0f1628; font-weight: bold; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-size: 16px;"
            >
              Acessar a plataforma
            </a>

            <p style="color: #718096; font-size: 12px; margin-top: 32px;">
              Em caso de dúvidas, entre em contato pelo e-mail
              <a href="mailto:eadcodestation@gmail.com" style="color: #63b3ed;">eadcodestation@gmail.com</a>
            </p>
          </div>
        </div>
      `,
    });
  } catch (error) {
    console.error("[Email] Erro ao enviar confirmação de pagamento:", error);
  }
}

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
