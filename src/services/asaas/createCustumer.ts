// src/services/asaas/createCustomer.ts
import { apiAsaas } from "@/lib/asaas";

export type createCustomer = {
  name: string;
  cpfCnpj: string;
  email: string;
  phone?: string;
  postalCode: string;
  addressNumber: string;
};

export async function createCustomer({
  name,
  cpfCnpj,
  email,
  phone,
  postalCode,
  addressNumber,
}: createCustomer) {
  const res = await apiAsaas.post("/customers", {
    name,
    cpfCnpj,
    email,
    mobilePhone: phone,
    postalCode,
    addressNumber,
  });
  return res.data.id; // ex: cus_0000123456
}
