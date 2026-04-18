import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Sessão inválida (outro login invalidou esta sessão)
  if ((token as any)?.sessionInvalid) {
    const loginUrl = (token as any)?.role === "admin"
      ? new URL("/admin/login?reason=session_expired", req.url)
      : new URL("/login?reason=session_expired", req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("__Secure-next-auth.session-token");
    return response;
  }

  // /admin/login — always accessible; redirect admin if already logged in
  if (pathname === "/admin/login") {
    if (token?.role === "admin") {
      return NextResponse.redirect(new URL("/backoffice", req.url));
    }
    return NextResponse.next();
  }

  // /login — always accessible; redirect if already logged in
  if (pathname.startsWith("/login")) {
    if (token && (token.role === "admin" || token.role === "student")) {
      return NextResponse.redirect(new URL("/painel", req.url));
    }
    return NextResponse.next();
  }

  // /backoffice — admin only
  if (pathname.startsWith("/backoffice")) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (token.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  // /painel — student or admin
  if (pathname.startsWith("/painel")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (token.role !== "admin" && token.role !== "student") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Aluno sem pagamento confirmado só acessa /painel/pagamento
    const pagamentoConfirmado = (token as any).payment?.status === "PAID";
    const pagamentoIsento = (token as any).paymentDeferred === true;
    const isAdmin = token.role === "admin";
    const isPaginaPagamento = pathname.startsWith("/painel/pagamento");

    if (!isAdmin && !pagamentoConfirmado && !pagamentoIsento && !isPaginaPagamento) {
      return NextResponse.redirect(new URL("/painel/pagamento", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/backoffice/:path*", "/admin/login", "/login", "/painel/:path*"],
  unstable_allowDynamic: [
    "/node_modules/@babel/runtime/regenerator/index.js",
    "/node_modules/next-auth/core/errors.js",
    "/node_modules/next-auth/utils/logger.js",
    "/node_modules/next-auth/react/index.js",
  ],
};
