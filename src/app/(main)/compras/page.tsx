import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ShoppingBag, Handshake } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { TransactionCard } from '@/components/transaction/TransactionCard'
import { formatPrice } from '@/lib/utils'
import type { TransactionStatus } from '@prisma/client'

const STATUS_GROUPS: { status: TransactionStatus; title: string }[] = [
  { status: 'PENDING', title: 'aguardando pagamento' },
  { status: 'PAID', title: 'vendedor preparando envio' },
  { status: 'SHIPPED', title: 'a caminho' },
  { status: 'DELIVERED', title: 'aguardando sua confirmação' },
  { status: 'COMPLETED', title: 'concluídas' },
  { status: 'CANCELLED', title: 'canceladas' },
]

export default async function ComprasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?redirectTo=/compras')

  const [transactions, pendingOffersCount, recentOffer] = await Promise.all([
    db.transaction.findMany({
      where: { buyerId: session.user.id },
      include: {
        listing: {
          include: { images: { orderBy: { displayOrder: 'asc' }, take: 1 } },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.offer.count({
      where: {
        buyerId: session.user.id,
        status: { in: ['PENDING_SELLER', 'PENDING_BUYER'] },
        expiresAt: { gt: new Date() },
      },
    }),
    db.offer.findFirst({
      where: {
        buyerId: session.user.id,
        status: { in: ['PENDING_SELLER', 'PENDING_BUYER'] },
        expiresAt: { gt: new Date() },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        currentPriceCents: true,
        listing: { select: { title: true } },
      },
    }),
  ])

  const grouped = STATUS_GROUPS.map((group) => ({
    ...group,
    items: transactions.filter((t) => t.status === group.status),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/" className="text-[var(--foreground)]">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[17px] font-black text-[var(--foreground)]">minhas compras</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        {pendingOffersCount > 0 && (
          <Link
            href="/compras/ofertas"
            className="flex items-center justify-between px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-[var(--color-pine)] shadow-sm hover:border-orange-200 dark:hover:border-orange-500/20 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                <Handshake size={18} className="text-orange-500 dark:text-orange-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[var(--foreground)]">minhas ofertas</p>
                <p className="text-[11px] text-gray-400 dark:text-[var(--color-sage)] mt-0.5 truncate">
                  {recentOffer
                    ? `${recentOffer.listing.title.toLowerCase()} · ${formatPrice(recentOffer.currentPriceCents)}`
                    : `${pendingOffersCount} em andamento`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-orange-500 text-white text-[10px] font-black flex items-center justify-center">
                {pendingOffersCount}
              </span>
              <ChevronRight size={16} className="text-gray-300 dark:text-white/20 group-hover:text-gray-400 transition-colors" />
            </div>
          </Link>
        )}

        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <ShoppingBag size={28} className="text-gray-300 dark:text-sage/30" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-[var(--foreground)]">nenhuma compra ainda</p>
              <p className="text-[13px] text-gray-400 dark:text-sage mt-1">
                explore o feed e encontre algo incrível
              </p>
            </div>
            <Link
              href="/"
              className="px-6 py-3 rounded-full bg-[var(--color-teal)] text-white text-[14px] font-bold"
            >
              explorar produtos
            </Link>
          </div>
        )}

        {grouped.map((group) => (
          <section key={group.status}>
            <h2 className="text-[13px] font-bold text-gray-400 dark:text-sage uppercase tracking-wide mb-3">
              {group.title} ({group.items.length})
            </h2>
            <div className="space-y-2">
              {group.items.map((tx) => {
                const imageUrl = tx.listing.images[0]?.url
                const subtitle =
                  tx.status === 'SHIPPED' && tx.trackingCode
                    ? `rastreio: ${tx.trackingCode}`
                    : undefined

                return (
                  <TransactionCard
                    key={tx.id}
                    id={tx.id}
                    href={`/compras/${tx.id}`}
                    imageUrl={imageUrl}
                    title={tx.listing.title}
                    amountCents={tx.amountCents}
                    status={tx.status}
                    createdAt={tx.createdAt}
                    subtitle={subtitle}
                  />
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
