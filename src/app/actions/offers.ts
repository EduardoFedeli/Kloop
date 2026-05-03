'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { createOfferSchema, respondOfferSchema } from '@/lib/validators/offers'
import {
  expireOfferIfStale,
  canCounter,
  nextTurnUserId,
  OFFER_TTL_MS,
} from '@/lib/offers'
import { calculateShipping } from '@/lib/shipping'
import type { Prisma, OfferStatus } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateOfferResult =
  | { offerId: string; autoAccepted?: boolean; transactionId?: string }
  | { error: 'unauthenticated' }
  | { error: 'listing_not_available' }
  | { error: 'offers_not_accepted' }
  | { error: 'cannot_offer_own_listing' }
  | { error: 'price_above_listing' }
  | { error: 'existing_active_offer'; existingOfferId: string }
  | { error: string }

export type RespondOfferResult =
  | { ok: true; transactionId?: string }
  | { error: 'unauthenticated' }
  | { error: 'offer_not_found' }
  | { error: 'offer_expired' }
  | { error: 'invalid_status' }
  | { error: 'not_your_turn' }
  | { error: 'listing_not_available' }
  | { error: 'buyer_address_required' }
  | { error: 'max_rounds_reached' }
  | { error: 'price_above_listing' }
  | { error: string }

// ─── Utility: cascade cancel ───────────────────────────────────────────────────

export async function cancelOtherOffers(
  tx: Prisma.TransactionClient,
  listingId: string,
  exceptOfferId?: string,
): Promise<void> {
  const activeStatuses: OfferStatus[] = ['PENDING_SELLER', 'PENDING_BUYER', 'ACCEPTED']
  await tx.offer.updateMany({
    where: {
      listingId,
      status: { in: activeStatuses },
      ...(exceptOfferId ? { id: { not: exceptOfferId } } : {}),
    },
    data: {
      status: 'CANCELLED',
      currentTurnUserId: null,
    },
  })
}

// ─── Action: createOffer ───────────────────────────────────────────────────────

export async function createOffer(input: {
  listingId: string
  priceCents: number
}): Promise<CreateOfferResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'unauthenticated' }
  const buyerId = session.user.id

  const parsed = createOfferSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  const { listingId, priceCents } = parsed.data

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      slug: true,
      sellerId: true,
      priceCents: true,
      status: true,
      acceptsOffers: true,
      smartPriceEnabled: true,
      idealPriceMinCents: true,
    },
  })

  if (!listing || listing.status !== 'ACTIVE') return { error: 'listing_not_available' }
  if (!listing.acceptsOffers) return { error: 'offers_not_accepted' }
  if (listing.sellerId === buyerId) return { error: 'cannot_offer_own_listing' }
  if (priceCents > listing.priceCents) return { error: 'price_above_listing' }

  const existingActive = await db.offer.findFirst({
    where: {
      listingId,
      buyerId,
      sellerId: listing.sellerId,
      status: { in: ['PENDING_SELLER', 'PENDING_BUYER', 'ACCEPTED'] },
    },
    select: { id: true },
  })
  if (existingActive) {
    return { error: 'existing_active_offer', existingOfferId: existingActive.id }
  }

  const expiresAt = new Date(Date.now() + OFFER_TTL_MS)
  const isInSmartRange =
    listing.smartPriceEnabled &&
    listing.idealPriceMinCents !== null &&
    priceCents >= listing.idealPriceMinCents

  if (isInSmartRange) {
    // Auto-accept: build the full transaction immediately
    let transactionId: string
    try {
      transactionId = await db.$transaction(async (tx) => {
        const freshListing = await tx.listing.findUnique({
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
        if (!freshListing || freshListing.status !== 'ACTIVE') throw new Error('LISTING_NOT_AVAILABLE')

        const buyerAddress = await tx.address.findFirst({
          where: { userId: buyerId, isDefault: true },
          select: { id: true, zipCode: true },
        })
        if (!buyerAddress) throw new Error('BUYER_ADDRESS_REQUIRED')

        const sellerZip = freshListing.seller.addresses[0]?.zipCode ?? ''
        const shipping = calculateShipping(sellerZip, buyerAddress.zipCode)
        const commissionRateNum = parseFloat(
          (freshListing.seller.subscription?.plan?.commissionRate ?? '0.0800').toString(),
        )
        const commissionCents = Math.round(priceCents * commissionRateNum)
        const amountCents = priceCents + shipping.priceCents

        const createdTx = await tx.transaction.create({
          data: {
            listingId,
            buyerId,
            sellerId: listing.sellerId,
            amountCents,
            shippingCents: shipping.priceCents,
            commissionCents,
            commissionRate: commissionRateNum,
            addressId: buyerAddress.id,
            status: 'PENDING',
          },
          select: { id: true },
        })

        const createdOffer = await tx.offer.create({
          data: {
            listingId,
            buyerId,
            sellerId: listing.sellerId,
            status: 'ACCEPTED',
            currentTurnUserId: null,
            expiresAt,
            roundsCount: 1,
            listingPriceCentsAtCreation: listing.priceCents,
            currentPriceCents: priceCents,
            transactionId: createdTx.id,
          },
          select: { id: true },
        })

        await tx.offerRound.create({
          data: { offerId: createdOffer.id, roundNumber: 1, proposedBy: buyerId, priceCents },
        })

        return createdTx.id
      })
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'LISTING_NOT_AVAILABLE') return { error: 'listing_not_available' }
        if (err.message === 'BUYER_ADDRESS_REQUIRED') return { error: 'buyer_address_required' }
      }
      throw err
    }

    revalidatePath('/perfil/ofertas')
    revalidatePath('/vendas/ofertas')
    revalidatePath(`/listing/${listing.slug}`)
    return { offerId: transactionId, autoAccepted: true, transactionId }
  }

  const offer = await db.$transaction(async (tx) => {
    const created = await tx.offer.create({
      data: {
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        status: 'PENDING_SELLER',
        currentTurnUserId: listing.sellerId,
        expiresAt,
        roundsCount: 1,
        listingPriceCentsAtCreation: listing.priceCents,
        currentPriceCents: priceCents,
      },
      select: { id: true },
    })

    await tx.offerRound.create({
      data: {
        offerId: created.id,
        roundNumber: 1,
        proposedBy: buyerId,
        priceCents,
      },
    })

    return created
  })

  revalidatePath('/perfil/ofertas')
  revalidatePath('/vendas/ofertas')
  revalidatePath(`/listing/${listing.slug}`)

  return { offerId: offer.id }
}

// ─── Action: respondOffer ──────────────────────────────────────────────────────

export async function respondOffer(input: {
  offerId: string
  action: 'ACCEPT' | 'REJECT' | 'COUNTER'
  counterPriceCents?: number
}): Promise<RespondOfferResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'unauthenticated' }
  const actorId = session.user.id

  const parsed = respondOfferSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' }

  const { offerId, action, counterPriceCents } = parsed.data

  const offer = await db.offer.findUnique({
    where: { id: offerId },
    include: {
      listing: {
        select: {
          id: true,
          slug: true,
          priceCents: true,
          status: true,
          sellerId: true,
        },
      },
    },
  })

  if (!offer) return { error: 'offer_not_found' }

  // Lazy expiry
  const currentStatus = expireOfferIfStale(offer)
  if (currentStatus === 'EXPIRED' && offer.status !== 'EXPIRED') {
    await db.offer.update({
      where: { id: offerId },
      data: { status: 'EXPIRED', currentTurnUserId: null },
    })
    return { error: 'offer_expired' }
  }
  if (currentStatus === 'EXPIRED') return { error: 'offer_expired' }

  if (offer.status !== 'PENDING_SELLER' && offer.status !== 'PENDING_BUYER') {
    return { error: 'invalid_status' }
  }

  if (offer.currentTurnUserId !== actorId) return { error: 'not_your_turn' }

  if (offer.listing.status !== 'ACTIVE') {
    await db.offer.update({
      where: { id: offerId },
      data: { status: 'CANCELLED', currentTurnUserId: null },
    })
    return { error: 'listing_not_available' }
  }

  const revalidate = () => {
    revalidatePath('/perfil/ofertas')
    revalidatePath('/vendas/ofertas')
    revalidatePath(`/ofertas/${offerId}`)
  }

  if (action === 'REJECT') {
    await db.offer.update({
      where: { id: offerId },
      data: { status: 'REJECTED', currentTurnUserId: null },
    })
    revalidate()
    return { ok: true }
  }

  if (action === 'ACCEPT') {
    let transactionId: string

    try {
      transactionId = await db.$transaction(async (tx) => {
        const freshListing = await tx.listing.findUnique({
          where: { id: offer.listingId },
          include: {
            seller: {
              include: {
                subscription: { include: { plan: { select: { commissionRate: true } } } },
                addresses: { where: { isDefault: true }, select: { zipCode: true }, take: 1 },
              },
            },
          },
        })

        if (!freshListing || freshListing.status !== 'ACTIVE') {
          throw new Error('LISTING_NOT_AVAILABLE')
        }

        const buyerAddress = await tx.address.findFirst({
          where: { userId: offer.buyerId, isDefault: true },
          select: { id: true, zipCode: true },
        })

        if (!buyerAddress) throw new Error('BUYER_ADDRESS_REQUIRED')

        const sellerZip = freshListing.seller.addresses[0]?.zipCode ?? ''
        const shipping = calculateShipping(sellerZip, buyerAddress.zipCode)

        const commissionRateNum = parseFloat(
          (freshListing.seller.subscription?.plan?.commissionRate ?? '0.0800').toString(),
        )
        const commissionCents = Math.round(offer.currentPriceCents * commissionRateNum)
        const amountCents = offer.currentPriceCents + shipping.priceCents

        const created = await tx.transaction.create({
          data: {
            listingId: offer.listingId,
            buyerId: offer.buyerId,
            sellerId: offer.sellerId,
            amountCents,
            shippingCents: shipping.priceCents,
            commissionCents,
            commissionRate: commissionRateNum,
            addressId: buyerAddress.id,
            status: 'PENDING',
          },
          select: { id: true },
        })

        await tx.offer.update({
          where: { id: offerId },
          data: {
            status: 'ACCEPTED',
            currentTurnUserId: null,
            transactionId: created.id,
          },
        })

        await cancelOtherOffers(tx, offer.listingId, offerId)

        return created.id
      })
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === 'LISTING_NOT_AVAILABLE') return { error: 'listing_not_available' }
        if (err.message === 'BUYER_ADDRESS_REQUIRED') return { error: 'buyer_address_required' }
      }
      throw err
    }

    revalidate()
    return { ok: true, transactionId }
  }

  // COUNTER
  if (counterPriceCents === undefined) return { error: 'Dados inválidos' }
  if (!canCounter(offer.roundsCount)) return { error: 'max_rounds_reached' }
  if (counterPriceCents > offer.listing.priceCents) return { error: 'price_above_listing' }

  const actorIsSeller = actorId === offer.sellerId
  if (actorIsSeller && counterPriceCents <= offer.currentPriceCents) {
    return { error: 'counter_must_be_above_current' }
  }
  if (!actorIsSeller && counterPriceCents >= offer.currentPriceCents) {
    return { error: 'counter_must_be_below_current' }
  }

  const newStatus: 'PENDING_BUYER' | 'PENDING_SELLER' =
    actorId === offer.sellerId ? 'PENDING_BUYER' : 'PENDING_SELLER'

  await db.$transaction(async (tx) => {
    await tx.offerRound.create({
      data: {
        offerId,
        roundNumber: offer.roundsCount + 1,
        proposedBy: actorId,
        priceCents: counterPriceCents,
      },
    })

    await tx.offer.update({
      where: { id: offerId },
      data: {
        currentPriceCents: counterPriceCents,
        roundsCount: offer.roundsCount + 1,
        currentTurnUserId: nextTurnUserId(offer, actorId),
        status: newStatus,
        expiresAt: new Date(Date.now() + OFFER_TTL_MS),
      },
    })
  })

  revalidate()
  return { ok: true }
}
