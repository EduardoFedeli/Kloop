import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { expireOfferIfStale, MAX_ROUNDS } from '@/lib/offers'
import { OfferStatusBadge } from '@/components/offers/OfferStatusBadge'
import { OfferCountdown } from '@/components/offers/OfferCountdown'
import { OfferActions } from '@/components/offers/OfferActions'

export const dynamic = 'force-dynamic'

export default async function OfferDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  const offer = await db.offer.findUnique({
    where: { id },
    include: {
      listing: {
        select: {
          title: true,
          slug: true,
          priceCents: true,
          images: { take: 1, orderBy: { displayOrder: 'asc' }, select: { url: true } },
        },
      },
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
      rounds: { orderBy: { roundNumber: 'asc' } },
      transaction: { select: { id: true, status: true } },
    },
  })

  if (!offer) notFound()
  if (offer.buyerId !== userId && offer.sellerId !== userId) notFound()

  // Lazy expiry
  const effectiveStatus = expireOfferIfStale(offer)
  if (effectiveStatus === 'EXPIRED' && offer.status !== 'EXPIRED') {
    await db.offer.update({
      where: { id: offer.id },
      data: { status: 'EXPIRED', currentTurnUserId: null },
    })
    offer.status = 'EXPIRED'
    offer.currentTurnUserId = null
  }

  const role = offer.buyerId === userId ? 'buyer' : 'seller'
  const isActive = offer.status === 'PENDING_SELLER' || offer.status === 'PENDING_BUYER'
  const isAccepted = offer.status === 'ACCEPTED'
  const isClosed = !isActive && !isAccepted
  const image = offer.listing.images[0]?.url

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          href={role === 'buyer' ? '/perfil/ofertas' : '/vendas/ofertas'}
          className="p-1.5 -ml-1.5 text-gray-400 hover:text-[var(--foreground)] transition-colors"
        >
          <ChevronLeft size={22} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-[15px] font-black text-[var(--foreground)] truncate">
            {offer.listing.title.toLowerCase()}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <OfferStatusBadge status={offer.status} />
            {isActive && <OfferCountdown expiresAt={offer.expiresAt} />}
          </div>
        </div>
        <Link
          href={`/listing/${offer.listing.slug}`}
          className="p-1.5 text-gray-400 hover:text-[var(--color-teal)] transition-colors shrink-0"
          title="ver anúncio"
        >
          <ExternalLink size={18} />
        </Link>
      </div>

      {/* ── Listing card ── */}
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/5 mb-5">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0 relative">
          {image && <Image src={image} alt={offer.listing.title} fill sizes="48px" className="object-cover" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400 dark:text-sage">preço original</p>
          <p className="text-[16px] font-black text-[var(--foreground)]">
            {formatPrice(offer.listingPriceCentsAtCreation)}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-gray-400 dark:text-sage">rodada</p>
          <p className="text-[14px] font-black text-[var(--foreground)]">{offer.roundsCount}/{MAX_ROUNDS}</p>
        </div>
      </div>

      {/* ── Chat timeline ── */}
      <div className="flex-1 space-y-4 mb-6">
        {offer.rounds.map((round) => {
          const isFromBuyer = round.proposedBy === offer.buyerId
          const actor = isFromBuyer ? offer.buyer : offer.seller
          const initials = actor.name.substring(0, 2).toUpperCase()
          const isMine = round.proposedBy === userId

          return (
            <div
              key={round.id}
              className={`flex gap-3 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {actor.avatarUrl ? (
                  <Image
                    src={actor.avatarUrl}
                    alt={actor.name}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[var(--color-teal)] flex items-center justify-center text-white text-[11px] font-black">
                    {initials}
                  </div>
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <p className="text-[11px] text-gray-400 dark:text-sage px-1">
                  {isMine ? 'você' : actor.name.split(' ')[0].toLowerCase()}
                  {' '}
                  {isFromBuyer ? 'ofereceu' : 'contra-propôs'}
                  {' '}no produto
                </p>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    isMine
                      ? 'bg-[var(--color-teal)] text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-white/8 text-[var(--foreground)] rounded-tl-sm'
                  }`}
                >
                  <p className="text-[22px] font-black leading-none">
                    {formatPrice(round.priceCents)}
                  </p>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-sage/60 px-1">
                  {new Date(round.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom: CTA / Actions ── */}
      <div className="mt-auto space-y-3">
        {/* Buyer: pay now */}
        {isAccepted && role === 'buyer' && offer.transaction?.status === 'PENDING' && (
          <div className="rounded-2xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/15 px-5 py-4 text-center space-y-3">
            <p className="text-[13px] font-bold text-green-700 dark:text-green-400">
              🎉 sua oferta foi aceita!
            </p>
            <Link
              href={`/checkout/${offer.transaction.id}`}
              className="block w-full py-3.5 rounded-2xl bg-[var(--color-teal)] text-white text-[15px] font-black text-center hover:opacity-90"
            >
              pagar agora →
            </Link>
          </div>
        )}

        {/* Seller: waiting for buyer payment */}
        {isAccepted && role === 'seller' && (
          <div className="rounded-2xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-900/15 px-5 py-4 text-center">
            <p className="text-[13px] font-bold text-green-700 dark:text-green-400">
              oferta aceita — aguardando o comprador pagar
            </p>
          </div>
        )}

        {/* Closed */}
        {isClosed && (
          <div className="rounded-2xl border border-gray-100 dark:border-white/8 px-5 py-4 text-center">
            <p className="text-[13px] text-gray-400 dark:text-sage">
              esta negociação foi encerrada.
            </p>
          </div>
        )}

        {/* Active: respond actions */}
        {isActive && (
          <div className="rounded-2xl border border-gray-100 dark:border-white/8 p-4 bg-white dark:bg-[var(--color-pine)]/40">
            <OfferActions
              offerId={offer.id}
              role={role}
              status={offer.status as 'PENDING_BUYER' | 'PENDING_SELLER'}
              listingPriceCents={offer.listingPriceCentsAtCreation}
              currentPriceCents={offer.currentPriceCents}
              roundsCount={offer.roundsCount}
              maxRounds={MAX_ROUNDS}
            />
          </div>
        )}
      </div>
    </div>
  )
}
