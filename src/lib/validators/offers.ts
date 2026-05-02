import { z } from 'zod'

export const createOfferSchema = z.object({
  listingId: z.string().cuid('ID de anúncio inválido'),
  priceCents: z.number().int().min(1, 'Valor mínimo é R$ 0,01'),
})

export const respondOfferSchema = z
  .object({
    offerId: z.string().cuid('ID de oferta inválido'),
    action: z.enum(['ACCEPT', 'REJECT', 'COUNTER']),
    counterPriceCents: z.number().int().min(1).optional(),
  })
  .refine(
    (data) => data.action !== 'COUNTER' || data.counterPriceCents !== undefined,
    { message: 'counterPriceCents é obrigatório para contra-proposta', path: ['counterPriceCents'] },
  )

export type CreateOfferInput = z.infer<typeof createOfferSchema>
export type RespondOfferInput = z.infer<typeof respondOfferSchema>
