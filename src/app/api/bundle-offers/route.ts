import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const bundleOfferSchema = z.object({
  sellerId: z.string(),
  items: z.array(
    z.object({
      listingId: z.string(),
      priceCents: z.number().int().positive(),
    })
  ).min(1),
  offerTotalCents: z.number().int().positive(),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = bundleOfferSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
    }

    const { sellerId, items, offerTotalCents } = parsed.data

    if (session.user.id === sellerId) {
      return NextResponse.json({ error: 'Você não pode fazer oferta nos seus próprios itens' }, { status: 400 })
    }

    const listingTotal = items.reduce((sum, i) => sum + i.priceCents, 0)
    
    // TRAVA: Se for maior OU IGUAL ao valor do lote, recusa.
    if (offerTotalCents >= listingTotal) {
      return NextResponse.json({ error: 'A oferta deve ser menor que o valor total original do lote.' }, { status: 400 })
    }

    // ==========================================
    // MOCK DE MVP: Sacola é apenas teste de conversão.
    // Não registramos BundleOffer no DB real.
    // Retornamos um sucesso simulado para a UI fluir.
    // ==========================================

    return NextResponse.json({ bundleOfferId: `mock-bundle-${Date.now()}` }, { status: 201 })
  } catch (error) {
    console.error('[BUNDLE_OFFER_ERROR]', error)
    return NextResponse.json({ error: 'Erro interno ao processar a oferta. Tente novamente.' }, { status: 500 })
  }
}