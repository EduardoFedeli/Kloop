import { z } from "zod"

export const listingSchema = z.object({
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres").max(100, "Título muito longo"),
  description: z.string().min(10, "Descrição muito curta").max(2000, "Descrição muito longa"),
  priceCents: z.number().int("Preço inválido").positive("Preço deve ser positivo"),
  categoryId: z.string().min(1, "Categoria obrigatória"),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR"]),
  brand: z.string().max(50, "Marca muito longa").optional(),
  size: z.string().max(20, "Tamanho muito longo").optional(),
  imageUrls: z
    .array(z.string().url("URL de imagem inválida"))
    .min(1, "Adicione pelo menos 1 foto")
    .max(6, "Máximo 6 fotos"),
})

export type ListingFormValues = z.infer<typeof listingSchema>
