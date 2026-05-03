import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Star } from 'lucide-react'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tx?: string }>
}

export default async function ReviewPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { tx: transactionId } = await searchParams

  if (!transactionId) notFound()

  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?redirectTo=/listing/${slug}/review?tx=${transactionId}`)
  }

  const transaction = await db.transaction.findUnique({
    where: { id: transactionId },
    select: {
      id: true,
      buyerId: true,
      status: true,
      review: { select: { id: true, rating: true, comment: true } },
      listing: {
        select: {
          title: true,
          images: { take: 1, orderBy: { displayOrder: 'asc' }, select: { url: true } },
        },
      },
      seller: { select: { id: true, name: true } },
    },
  })

  if (!transaction) notFound()
  if (transaction.buyerId !== session.user.id) notFound()
  if (transaction.status !== 'COMPLETED') redirect('/compras')

  const imageUrl = transaction.listing.images[0]?.url

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/compras" className="text-[var(--foreground)]">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[17px] font-black text-[var(--foreground)]">avaliar vendedor</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <div className="flex gap-3 items-center bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={transaction.listing.title}
              width={56}
              height={56}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[var(--foreground)] leading-tight truncate">
              {transaction.listing.title.toLowerCase()}
            </p>
            <p className="text-[12px] text-gray-400 dark:text-sage mt-0.5">
              {transaction.seller.name.toLowerCase()}
            </p>
          </div>
        </div>

        {transaction.review ? (
          <div className="text-center py-10 space-y-3">
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={28}
                  className={
                    i < transaction.review!.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10'
                  }
                />
              ))}
            </div>
            <p className="text-[16px] font-bold text-[var(--foreground)]">você já avaliou esta compra</p>
            {transaction.review.comment && (
              <p className="text-[13px] text-gray-500 dark:text-sage italic">
                &ldquo;{transaction.review.comment}&rdquo;
              </p>
            )}
            <Link
              href="/compras"
              className="inline-block text-[14px] font-bold text-[var(--color-teal)] dark:text-[var(--color-celadon)]"
            >
              voltar para compras
            </Link>
          </div>
        ) : (
          <ReviewForm
            transactionId={transactionId}
            sellerName={transaction.seller.name}
            listingTitle={transaction.listing.title}
          />
        )}
      </div>
    </div>
  )
}
