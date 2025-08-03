import { apiAsaas } from "@/lib/asaas";
import { handleApiError } from "@/utils/api/handleApiError";

export async function findOrCreateCustomer(data: {
  firstName: string;
  lastName: string;
  email: string;
  cpf: string;
  address: {
    zipCode: string;
    number: string;
  };
}) {
  try {
    // 1. Buscar cliente por CPF
    const res = await apiAsaas.get("/customers", {
      params: { cpfCnpj: data.cpf },
    });

    if (res.data.totalCount > 0) {
      return res.data.data[0]; // cliente já existe
    }

    // 2. Criar cliente no Asaas
    const createRes = await apiAsaas.post("/customers", {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      cpfCnpj: data.cpf,
      postalCode: data.address.zipCode,
      addressNumber: data.address.number,
    });

    return createRes.data;
  } catch (error) {
    throw handleApiError(error);
  }
}
