import NextAuth from "next-auth";
import { STATUS_PAYMENT } from "@/const/paymentEnum";
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "student";
      cpf: string;
      contract: {
        isSigned: boolean;
        isValidated: boolean;
      };
      asaasCustomerId: string;
      payment: {
        status: keyof typeof STATUS_PAYMENT;
      };
      address: {
        zipCode: string;
        number: string;
      };
    };
  }

  interface User {
    id: string;
    role: "admin" | "student";
    name: string;
    email: string;
    asaasCustomerId: string;
    cpf: string;
    address: {
      zipCode: string;
      number: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    email: string;
    role: "admin" | "student";
    asaasCustomerId: string;
    cpf: string;
    contract: {
      isSigned: boolean;
      isValidated: boolean;
    };
    payment: {
      status: keyof typeof STATUS_PAYMENT;
    };
    address: {
      zipCode: string;
      number: string;
    };
  }
}
