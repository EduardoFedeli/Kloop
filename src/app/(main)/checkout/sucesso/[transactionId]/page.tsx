import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CheckCircle, Package } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

interface Props {
  params: Promise<{ transactionId: string }>
}

export default async function CheckoutSucessoPage({ params }: Props) {
  const { transactionId } = await params
  const session = await auth()

  if (!session?.user?.id) redirect('/')

  const transaction = await db.transaction.findUnique({
    where: { id: transactionId },
    include: {
      listing: {
        include: { images: { orderBy: { displayOrder: 'asc' }, take: 1 } },
      },
    },
  })

  if (!transaction) notFound()
  if (transaction.buyerId !== session.user.id) notFound()
  if (transaction.status !== 'PAID') redirect(`/compras/${transactionId}`)

  const imageUrl = transaction.listing.images[0]?.url

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[var(--color-teal)]/10 flex items-center justify-center">
            <CheckCircle size={40} className="text-[var(--color-teal)]" strokeWidth={2} />
          </div>
        </div>

        <div>
          <h1 className="text-[24px] font-black text-[var(--foreground)] leading-tight">
            compra realizada! 🎉
          </h1>
          <p className="text-[14px] text-gray-500 dark:text-sage mt-2">
            seu pagamento foi confirmado. o vendedor já foi notificado.
          </p>
        </div>

        <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4 text-left">
          <div className="flex gap-3">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={transaction.listing.title}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={20} className="text-gray-300" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-[var(--foreground)] truncate">
                {transaction.listing.title}
              </p>
              <div className="mt-1 space-y-0.5">
                <div className="flex justify-between text-[12px] text-gray-400 dark:text-sage">
                  <span>produto</span>
                  <span>{formatPrice(transaction.listing.priceCents)}</span>
                </div>
                <div className="flex justify-between text-[12px] text-gray-400 dark:text-sage">
                  <span>frete</span>
                  <span>{formatPrice(transaction.shippingCents)}</span>
                </div>
                <div className="flex justify-between text-[13px] font-black text-[var(--foreground)] pt-1 border-t border-gray-100 dark:border-white/5">
                  <span>total pago</span>
                  <span className="text-[var(--color-airforce)] dark:text-[var(--color-celadon)]">
                    {formatPrice(transaction.amountCents)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/compras"
            className="block w-full py-4 rounded-2xl bg-[var(--color-teal)] text-white text-[15px] font-black text-center hover:opacity-90 transition-opacity"
          >
            ver minhas compras
          </Link>
          <Link
            href="/"
            className="block w-full py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-[var(--foreground)] text-[14px] font-bold text-center hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
