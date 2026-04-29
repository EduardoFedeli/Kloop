import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { CheckoutForm } from '@/components/checkout/CheckoutForm'
import { getCashbackBalance, getMaxApplicable } from '@/lib/cashback'

interface Props {
  params: Promise<{ transactionId: string }>
}

export default async function CheckoutPage({ params }: Props) {
  const { transactionId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect(`/login?redirectTo=/checkout/${transactionId}`)
  }

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

  if (transaction.status !== 'PENDING') {
    redirect(`/compras/${transactionId}`)
  }

  const imageUrl = transaction.listing.images[0]?.url

  const [cashbackBalanceCents, cashbackMaxCents] = await Promise.all([
    getCashbackBalance(session.user.id),
    getMaxApplicable(session.user.id, transaction.listing.priceCents),
  ])

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href={`/listing/${transaction.listing.slug}`} className="text-[var(--foreground)]">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[17px] font-black text-[var(--foreground)]">checkout</h1>
      </div>

      <div className="pt-4">
        <CheckoutForm
          transactionId={transaction.id}
          listing={{
            title: transaction.listing.title,
            priceCents: transaction.listing.priceCents,
            imageUrl,
          }}
          shippingCents={transaction.shippingCents}
          amountCents={transaction.amountCents}
          cashbackBalanceCents={cashbackBalanceCents}
          cashbackMaxCents={cashbackMaxCents}
        />
      </div>
    </div>
  )
}
