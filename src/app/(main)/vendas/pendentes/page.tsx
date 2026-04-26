import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Package } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { TransactionCard } from '@/components/transaction/TransactionCard'
import type { TransactionStatus } from '@prisma/client'

const STATUS_GROUPS: { status: TransactionStatus; title: string }[] = [
  { status: 'PAID', title: 'aguardando envio' },
  { status: 'SHIPPED', title: 'enviados' },
  { status: 'DELIVERED', title: 'aguardando confirmação do comprador' },
]

export default async function VendasPendentesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?redirectTo=/vendas/pendentes')

  const transactions = await db.transaction.findMany({
    where: {
      sellerId: session.user.id,
      status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
    },
    include: {
      listing: {
        include: { images: { orderBy: { displayOrder: 'asc' }, take: 1 } },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const grouped = STATUS_GROUPS.map((group) => ({
    ...group,
    items: transactions.filter((t) => t.status === group.status),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/vendas" className="text-[var(--foreground)]">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[17px] font-black text-[var(--foreground)]">pedidos pendentes</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Package size={28} className="text-gray-300 dark:text-sage/30" />
            </div>
            <div>
              <p className="text-[16px] font-bold text-[var(--foreground)]">nenhum pedido pendente</p>
              <p className="text-[13px] text-gray-400 dark:text-sage mt-1">
                quando alguém comprar um produto seu, ele aparece aqui
              </p>
            </div>
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
                    href={`/vendas/pendentes/${tx.id}`}
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
