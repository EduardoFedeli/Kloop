import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createTransactionSchema } from '@/lib/validators/transaction'
import { calculateShipping } from '@/lib/shipping'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const buyerId = session.user.id

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 })
  }

  const parsed = createTransactionSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Dados inválidos'
    return NextResponse.json({ error: message }, { status: 422 })
  }

  const { listingId } = parsed.data

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    include: {
      seller: {
        include: {
          subscription: { include: { plan: { select: { commissionRate: true } } } },
          addresses: { where: { isDefault: true }, select: { zipCode: true }, take: 1 },
        },
      },
    },
  })

  if (!listing) {
    return NextResponse.json({ error: 'Anúncio não encontrado' }, { status: 404 })
  }

  if (listing.sellerId === buyerId) {
    return NextResponse.json({ error: 'Você não pode comprar seu próprio anúncio' }, { status: 400 })
  }

  if (listing.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Este produto não está mais disponível' }, { status: 409 })
  }

  const buyerAddress = await db.address.findFirst({
    where: { userId: buyerId, isDefault: true },
    select: { id: true, zipCode: true },
  })

  if (!buyerAddress) {
    return NextResponse.json(
      { error: 'Você precisa cadastrar um endereço antes de comprar' },
      { status: 400 },
    )
  }

  const sellerZip = listing.seller.addresses[0]?.zipCode ?? ''
  const shipping = calculateShipping(sellerZip, buyerAddress.zipCode)
  const shippingCents = shipping.priceCents

  const commissionRateNum = parseFloat(
    (listing.seller.subscription?.plan?.commissionRate ?? '0.0800').toString(),
  )
  const commissionCents = Math.round(listing.priceCents * commissionRateNum)
  const amountCents = listing.priceCents + shippingCents

  // Return existing PENDING transaction if buyer already initiated checkout
  const existing = await db.transaction.findFirst({
    where: { listingId, buyerId, status: 'PENDING' },
    select: { id: true },
  })
  if (existing) {
    return NextResponse.json({ transactionId: existing.id })
  }

  let transaction: { id: string }
  try {
    transaction = await db.$transaction(async (tx) => {
      // Re-check listing inside transaction to prevent race conditions
      const freshListing = await tx.listing.findUnique({
        where: { id: listingId },
        select: { status: true },
      })
      if (freshListing?.status !== 'ACTIVE') {
        throw new Error('LISTING_NOT_AVAILABLE')
      }

      return tx.transaction.create({
        data: {
          listingId,
          buyerId,
          sellerId: listing.sellerId,
          amountCents,
          shippingCents,
          commissionCents,
          commissionRate: commissionRateNum,
          addressId: buyerAddress.id,
          status: 'PENDING',
        },
        select: { id: true },
      })
    })
  } catch (err) {
    if (err instanceof Error && err.message === 'LISTING_NOT_AVAILABLE') {
      return NextResponse.json({ error: 'Este produto não está mais disponível' }, { status: 409 })
    }
    throw err
  }

  return NextResponse.json({ transactionId: transaction.id })
}
