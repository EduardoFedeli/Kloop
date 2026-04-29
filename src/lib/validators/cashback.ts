import { z } from 'zod'

export const cashbackPaySchema = z.object({
  cashbackUsedCents: z.number().int().min(0).optional().default(0),
})

export type CashbackPayInput = z.infer<typeof cashbackPaySchema>
