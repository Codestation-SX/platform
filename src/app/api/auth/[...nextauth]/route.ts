// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcryptjs";
import prisma from "@/lib/prisma";
import { STATUS_PAYMENT } from "@/const/paymentEnum";

const authOptions = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
          include: {
            address: true,
          },
        });

        if (!credentials || !credentials.password || !user || !user.password)
          return null;

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) return null;

        // Incrementa sessionVersion (invalida sessões anteriores) e registra lastLoginAt
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLoginAt: new Date(),
            sessionVersion: { increment: 1 },
          },
        });

        const updatedUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { sessionVersion: true },
        });

        console.log("User authenticated:", user);
        return {
          id: user.id,
          name: user.firstName + " " + user.lastName,
          email: user.email,
          role: user.role as "admin" | "student",
          asaasCustomerId: user.asaasCustomerId ?? "",
          cpf: user.cpf,
          address: {
            number: user.address?.number as string,
            zipCode: user.address?.zipCode as string,
          },
          sessionVersion: updatedUser?.sessionVersion ?? 1,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token, user }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as "admin" | "student";
        session.user.contract = token.contract;
        session.user.payment = token.payment;
        session.user.address = token.address;
        session.user.asaasCustomerId = token.asaasCustomerId;
        session.user.cpf = token.cpf as string;
        session.user.birthDate = token.birthDate as string;
        session.user.cidade = token.cidade as string;
        session.user.estado = token.estado as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Primeira execução: login — preenche todos os campos do token
        const userData = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            contract: true,
            payment: true,
            address: true,
          },
        });

        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.contract = {
          isSigned: userData?.contract?.isSigned || false,
          isValidated: userData?.contract?.isValidated || false,
        };
        token.payment = {
          status:
            (userData?.payment?.status as keyof typeof STATUS_PAYMENT) ||
            "PENDING",
        };
        token.paymentDeferred = userData?.paymentDeferred ?? false;
        token.asaasCustomerId = userData?.asaasCustomerId as string;
        token.address = {
          number: userData?.address?.number ?? "",
          zipCode: userData?.address?.zipCode ?? "",
        };
        token.cpf = userData?.cpf ?? "";
        token.birthDate = userData?.birthDate?.toISOString() ?? "";
        token.cidade = userData?.address?.city ?? "";
        token.estado = userData?.address?.state ?? "";
        token.sessionVersion = (user as any).sessionVersion ?? 1;
      } else if (token.id) {
        // Requisições subsequentes: atualiza campos dinâmicos do banco
        const userData = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            paymentDeferred: true,
            payment: { select: { status: true } },
            contract: { select: { isSigned: true, isValidated: true } },
            sessionVersion: true,
          },
        });

        if (userData) {
          token.paymentDeferred = userData.paymentDeferred ?? false;
          token.payment = {
            status:
              (userData.payment?.status as keyof typeof STATUS_PAYMENT) ||
              "PENDING",
          };
          token.contract = {
            isSigned: userData.contract?.isSigned || false,
            isValidated: userData.contract?.isValidated || false,
          };

          // Verifica se a sessão ainda é válida (session única por usuário)
          if (userData?.sessionVersion !== undefined && token.sessionVersion !== undefined) {
            if (userData.sessionVersion !== token.sessionVersion) {
              token.sessionInvalid = true;
            }
          }
        }
      }

      return token;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  logger: {
    error: (error) => console.error("NextAuth Error:", error),
    warn: (message) => console.warn("NextAuth Warning:", message),
    debug: (message) => console.debug("NextAuth Debug:", message),
  },
});

export { authOptions as GET, authOptions as POST };
