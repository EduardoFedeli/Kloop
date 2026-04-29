import { z } from "zod"

export const addressSchema = z.object({
  label: z.string().min(1).max(30).optional().default("Casa"),
  street: z.string().min(3, "Rua obrigatória").max(200),
  number: z.string().min(1, "Número obrigatório").max(20),
  complement: z.string().max(100).optional(),
  neighborhood: z.string().min(2, "Bairro obrigatório").max(100),
  city: z.string().min(2, "Cidade obrigatória").max(100),
  state: z.string().regex(/^[A-Za-z]{2}$/, "UF deve ter 2 letras"),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato: 00000-000)"),
})

export type AddressFormValues = z.infer<typeof addressSchema>
