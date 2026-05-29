import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json() as { listingId?: string; communityId?: string; userId?: string }
  const { listingId, userId } = body

  if (!listingId || !userId) {
    return NextResponse.json({ error: 'campos obrigatórios ausentes' }, { status: 400 })
  }

  const listing = await db.listing.findUnique({
    where: { id: listingId, status: 'ACTIVE' },
    select: { id: true, priceCents: true, sellerId: true },
  })

  if (!listing) {
    return NextResponse.json({ error: 'anúncio não encontrado ou indisponível' }, { status: 404 })
  }

  if (listing.sellerId === userId) {
    return NextResponse.json({ error: 'você não pode comprar seu próprio item' }, { status: 400 })
  }

  const transaction = await db.transaction.create({
    data: {
      listingId,
      buyerId: userId,
      sellerId: listing.sellerId,
      amountCents: listing.priceCents,
      commissionCents: Math.round(listing.priceCents * 0.14),
      commissionRate: 0.14,
      paymentMethod: 'PIX',
      status: 'AWAITING_PAYMENT',
    },
  })

  return NextResponse.json({ txId: transaction.id })
}
