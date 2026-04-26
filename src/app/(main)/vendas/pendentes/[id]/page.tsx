import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Package } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice, formatDate } from '@/lib/utils'
import { StatusTimeline } from '@/components/transaction/StatusTimeline'
import { SellerOrderActions } from '@/components/transaction/SellerOrderActions'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VendaDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect(`/login?redirectTo=/vendas/pendentes/${id}`)

  const transaction = await db.transaction.findUnique({
    where: { id },
    include: {
      listing: {
        include: {
          images: { orderBy: { displayOrder: 'asc' }, take: 1 },
        },
      },
      buyer: { select: { name: true, id: true } },
    },
  })

  if (!transaction) notFound()
  if (transaction.sellerId !== session.user.id) notFound()

  const imageUrl = transaction.listing.images[0]?.url

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/vendas/pendentes" className="text-[var(--foreground)]">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[17px] font-black text-[var(--foreground)]">detalhe do pedido</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {/* Product card */}
        <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4">
          <div className="flex gap-3">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={transaction.listing.title}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={24} className="text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-[var(--foreground)] leading-tight">
                {transaction.listing.title}
              </p>
              <p className="text-[12px] text-gray-400 dark:text-sage mt-0.5">
                comprador: {transaction.buyer.name ?? 'desconhecido'}
              </p>
              <div className="mt-2 space-y-0.5">
                <div className="flex justify-between text-[12px] text-gray-400 dark:text-sage">
                  <span>produto</span>
                  <span>{formatPrice(transaction.listing.priceCents)}</span>
                </div>
                <div className="flex justify-between text-[12px] text-gray-400 dark:text-sage">
                  <span>frete</span>
                  <span>{formatPrice(transaction.shippingCents)}</span>
                </div>
                <div className="flex justify-between text-[13px] font-black text-[var(--foreground)] pt-1 border-t border-gray-100 dark:border-white/5">
                  <span>valor da venda</span>
                  <span className="text-[var(--color-airforce)] dark:text-[var(--color-celadon)]">
                    {formatPrice(transaction.amountCents)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 dark:text-sage/60 mt-3">
            pedido realizado em {formatDate(transaction.createdAt)}
          </p>
        </div>

        {/* Tracking code */}
        {transaction.trackingCode && (
          <div className="bg-blue-50 dark:bg-blue-500/10 rounded-2xl p-4">
            <p className="text-[12px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
              código de rastreio
            </p>
            <p className="font-mono text-[13px] text-[var(--foreground)]">{transaction.trackingCode}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
          <p className="text-[13px] font-bold text-gray-400 dark:text-sage uppercase tracking-wide mb-4">
            status do pedido
          </p>
          <StatusTimeline currentStatus={transaction.status} />
        </div>

        {/* Action buttons */}
        <SellerOrderActions transactionId={transaction.id} status={transaction.status} />
      </div>
    </div>
  )
}
