import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const ADMIN_EMAIL = "eadcodestation@gmail.com";
export const FROM_EMAIL = "Codestation <noreply@eadcodestation.com.br>";
