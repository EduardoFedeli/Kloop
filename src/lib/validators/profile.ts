import { z } from "zod"

export const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  bio: z.string().max(500, "Bio deve ter no máximo 500 caracteres").optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s\(\)\-]{8,20}$/, "Telefone inválido")
    .optional(),
  avatarUrl: z.string().url("URL de avatar inválida").optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
