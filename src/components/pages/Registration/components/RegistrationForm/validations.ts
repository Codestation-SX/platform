import * as z from "zod";

const cpfRegex = /^\d{11}$/;
export const rgRegex = /^\d{7,11}$/;
const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

export const addressSchema = z.object({
  zipCode: z.string().min(1, "CEP é obrigatório"),
  state: z.string().min(1, "Estado é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  street: z.string().min(1, "Endereço é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(1, "Nome obrigatório"),
    lastName: z.string().min(1, "Sobrenome obrigatório"),
    rg: z.string().regex(rgRegex, "RG inválido").optional(),
    cpf: z.string().regex(cpfRegex, "CPF inválido"),
    birthDate: z
      .date({ required_error: "Data de nascimento obrigatória" })
      .refine(
        (date) => {
          const today = new Date();
          const minDate = new Date(
            today.getFullYear() - 15,
            today.getMonth(),
            today.getDate()
          );
          return date <= minDate;
        },
        {
          message: "Você precisa ter pelo menos 15 anos",
        }
      ),
    educationLevel: z.string().min(1, "Escolaridade obrigatória"),
    email: z.string().email("E-mail inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string().min(6, "Mínimo 6 caracteres"),
    address: addressSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
