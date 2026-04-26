import { z } from 'zod'
import { PaymentMethod } from '@prisma/client'

export const createTransactionSchema = z.object({
  listingId: z.string().cuid('ID de anúncio inválido'),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
})

export const shipTransactionSchema = z.object({
  trackingCode: z.string().min(1).max(100).optional(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type ShipTransactionInput = z.infer<typeof shipTransactionSchema>
