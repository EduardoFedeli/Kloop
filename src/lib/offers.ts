import { OfferStatus } from '@prisma/client'

export const MAX_ROUNDS = 4
export const OFFER_TTL_MS = 24 * 60 * 60 * 1000

const TERMINAL_STATUSES: OfferStatus[] = ['ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED']

type OfferForExpiry = {
  expiresAt: Date
  status: OfferStatus
}

export function expireOfferIfStale(offer: OfferForExpiry): OfferStatus {
  if (TERMINAL_STATUSES.includes(offer.status)) return offer.status
  if (new Date() > offer.expiresAt) return 'EXPIRED'
  return offer.status
}

export function canCounter(roundsCount: number): boolean {
  return roundsCount < MAX_ROUNDS
}

type OfferForTurn = {
  buyerId: string
  sellerId: string
}

export function nextTurnUserId(offer: OfferForTurn, currentActorId: string): string {
  return currentActorId === offer.buyerId ? offer.sellerId : offer.buyerId
}
