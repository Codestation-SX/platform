import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
interface InterceptRequest extends NextRequest, NextRequestWithAuth {}
import { getToken } from "next-auth/jwt";

export default withAuth(
  async function middleware(req: InterceptRequest) {
    const { pathname } = req.nextUrl;
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
    console.log(pathname, token);
    // Se estiver tentando acessar a área /backoffice
    if (pathname.startsWith("/backoffice")) {
      // Se não tiver token, redirecione para login
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }

      // Se tiver token mas não for admin, redirecione para login
      if (pathname !== "/backoffice/login" && token.role !== "admin") {
        return NextResponse.redirect(new URL("/backoffice/login", req.url));
      }

      // Se estiver tentando acessar /backoffice/login mas já estiver autenticado
      if (pathname === "/backoffice/login" && token && token.role === "admin") {
        return NextResponse.redirect(new URL("/backoffice", req.url));
      }
    }
    if (pathname.startsWith("/painel")) {
      // Se não tiver token, redirecione para login
      if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Se tiver token mas não for admin nem student, redirecione para login
      if (token.role !== "admin" && token.role !== "student") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    // Se estiver tentando acessar /login mas já estiver autenticado
    if (
      pathname.startsWith("/login") &&
      token &&
      (token.role === "admin" || token.role === "student")
    ) {
      return NextResponse.redirect(new URL("/painel", req.url));
    }
    // Se todas as verificações passarem, continue com a requisição
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: async ({ req }) => {
        const token = await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET,
        });

        // Se a rota for /backoffice/login, permita o acesso mesmo sem token
        if (req.nextUrl.pathname === "/backoffice/login") {
          return true;
        }

        if (req.nextUrl.pathname === "/login") {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/backoffice/:path*", "/login", "/painel/:path*"],
  unstable_allowDynamic: [
    "/node_modules/@babel/runtime/regenerator/index.js",
    "/node_modules/next-auth/core/errors.js",
    "/node_modules/next-auth/utils/logger.js",
    "/node_modules/next-auth/react/index.js",
  ],
};
