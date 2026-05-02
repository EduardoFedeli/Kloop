import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { OfferStatus } from '@prisma/client'

export const dynamic = 'force-dynamic'

type OfferRow = {
  id: string
  status: OfferStatus
  currentPriceCents: number
  expiresAt: Date
  roundsCount: number
  currentTurnUserId: string | null
  transaction: { status: string } | null
  listing: {
    title: string
    slug: string
    images: { url: string }[]
  }
}

const STATUS_LABEL: Record<OfferStatus, string> = {
  PENDING_SELLER: 'aguardando sua resposta',
  PENDING_BUYER: 'aguardando comprador',
  ACCEPTED: 'aceita — comprador pagando',
  REJECTED: 'recusada',
  EXPIRED: 'expirada',
  CANCELLED: 'cancelada',
}

function OfferCard({ offer }: { offer: OfferRow }) {
  const isUrgent = offer.status === 'PENDING_SELLER'
  const image = offer.listing.images[0]?.url

  return (
    <Link
      href={`/ofertas/${offer.id}`}
      className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 dark:border-white/8 hover:border-[var(--color-teal)]/40 transition-colors"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0 relative">
        {image && <Image src={image} alt={offer.listing.title} fill sizes="56px" className="object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-[var(--foreground)] truncate">{offer.listing.title.toLowerCase()}</p>
        <p className="text-[15px] font-black text-[var(--color-teal)]">{formatPrice(offer.currentPriceCents)}</p>
        <p className={`text-[11px] font-medium mt-0.5 ${isUrgent ? 'text-orange-500' : 'text-gray-400 dark:text-sage'}`}>
          {STATUS_LABEL[offer.status]}
        </p>
      </div>
    </Link>
  )
}

function Section({ title, offers }: { title: string; offers: OfferRow[] }) {
  if (offers.length === 0) return null
  return (
    <div className="space-y-2">
      <h2 className="text-[12px] font-black text-gray-400 dark:text-sage uppercase tracking-widest px-0.5">{title}</h2>
      <div className="space-y-2">
        {offers.map((o) => <OfferCard key={o.id} offer={o} />)}
      </div>
    </div>
  )
}

export default async function VendasOfertasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  const userId = session.user.id

  await db.offer.updateMany({
    where: {
      sellerId: userId,
      status: { in: ['PENDING_SELLER', 'PENDING_BUYER'] },
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED', currentTurnUserId: null },
  })

  const offers = await db.offer.findMany({
    where: { sellerId: userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      status: true,
      currentPriceCents: true,
      expiresAt: true,
      roundsCount: true,
      currentTurnUserId: true,
      transaction: { select: { status: true } },
      listing: {
        select: {
          title: true,
          slug: true,
          images: { take: 1, orderBy: { displayOrder: 'asc' }, select: { url: true } },
        },
      },
    },
  })

  const pendingSeller = offers.filter((o) => o.status === 'PENDING_SELLER')
  const pendingBuyer = offers.filter((o) => o.status === 'PENDING_BUYER')
  const accepted = offers.filter((o) => o.status === 'ACCEPTED' && o.transaction?.status === 'PENDING')
  const closed = offers.filter(
    (o) =>
      ['REJECTED', 'EXPIRED', 'CANCELLED'].includes(o.status) ||
      (o.status === 'ACCEPTED' && o.transaction?.status !== 'PENDING'),
  )

  if (offers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">
        <span className="text-7xl select-none">📬</span>
        <div className="space-y-2">
          <h3 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">nenhuma oferta recebida</h3>
          <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed max-w-[280px]">
            quando compradores fizerem ofertas nos seus anúncios, elas aparecem aqui.
          </p>
        </div>
        <Link
          href="/vendas"
          className="border-2 border-[var(--color-pine)] dark:border-[var(--color-teal)] text-[var(--color-pine)] dark:text-[var(--color-teal)] px-8 py-3 rounded-full font-bold text-[14px] hover:bg-[var(--color-pine)]/5 dark:hover:bg-[var(--color-teal)]/5 transition-colors"
        >
          ver painel de vendas
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Section title="aguardando sua resposta" offers={pendingSeller} />
      <Section title="aceitas — comprador tem até 24h pra pagar" offers={accepted} />
      <Section title="aguardando comprador" offers={pendingBuyer} />
      <Section title="encerradas" offers={closed} />
    </div>
  )
}
