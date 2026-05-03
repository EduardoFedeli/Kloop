import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { ChevronLeft, Star, MessageSquare } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AvaliacoesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?redirectTo=/vendas/avaliacoes')

  const myId = session.user.id

  const rawReviews = await db.review.findMany({
    where: { reviewedId: myId },
    select: {
      id: true,
      rating: true,
      comment: true,
      // tags: true, <-- REMOVIDO PARA PARAR O ERRO DO PRISMA
      createdAt: true,
      reviewer: { select: { name: true } },
      transaction: {
        select: {
          listing: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // TRUQUE DO MVP: Desfazendo a concatenação que fizemos na rota de criar review
  const reviews = rawReviews.map((review) => {
    let tags: string[] = []
    let cleanComment = review.comment || ''

    // Se o comentário começa com '[' significa que temos tags embutidas
    if (cleanComment.startsWith('[')) {
      const endBracketIndex = cleanComment.indexOf(']')
      if (endBracketIndex !== -1) {
        // Extrai as tags separadas por vírgula
        const tagsString = cleanComment.slice(1, endBracketIndex)
        tags = tagsString.split(',').map(t => t.trim()).filter(Boolean)

        // Pega o restante do comentário após as tags
        let restOfComment = cleanComment.slice(endBracketIndex + 1).trim()
        
        // Remove o "- " que adicionamos na hora de salvar, se existir
        if (restOfComment.startsWith('- ')) {
          restOfComment = restOfComment.slice(2).trim()
        }
        
        cleanComment = restOfComment
      }
    }

    return {
      ...review,
      tags,
      comment: cleanComment,
    }
  })

  const totalRatings = reviews.length
  const avgRating = totalRatings > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / totalRatings
    : null

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[var(--color-pine)]/90 backdrop-blur-sm border-b border-gray-100 dark:border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/vendas" className="text-[var(--foreground)]">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </Link>
        <h1 className="text-[17px] font-black text-[var(--foreground)]">minhas avaliações</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">

        {/* Rating summary */}
        {totalRatings > 0 && (
          <div className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-5">
            <div className="flex gap-5 items-center">
              <div className="text-center flex-shrink-0">
                <p className="text-[44px] font-black text-[var(--foreground)] leading-none">
                  {avgRating!.toFixed(1)}
                </p>
                <div className="flex justify-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < Math.round(avgRating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10'
                      }
                    />
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 dark:text-sage mt-1">
                  {totalRatings} {totalRatings === 1 ? 'avaliação' : 'avaliações'}
                </p>
              </div>

              <div className="flex-1 space-y-1.5">
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-400 dark:text-sage w-3 text-right">{star}</span>
                    <Star size={10} className="fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${(count / totalRatings) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-gray-400 dark:text-sage w-4">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Reviews list */}
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <MessageSquare size={24} className="text-gray-300 dark:text-sage/30" />
            </div>
            <p className="text-[15px] font-bold text-[var(--foreground)]">nenhuma avaliação ainda</p>
            <p className="text-[13px] text-gray-400 dark:text-sage">
              as avaliações dos seus compradores aparecem aqui
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[var(--foreground)] truncate">
                      {review.transaction.listing.title.toLowerCase()}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-sage mt-0.5">
                      {review.reviewer.name.toLowerCase()} · {formatDate(review.createdAt).split(' às')[0]}
                    </p>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'fill-gray-200 text-gray-200 dark:fill-white/10 dark:text-white/10'
                        }
                      />
                    ))}
                  </div>
                </div>

                {review.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {review.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--color-teal)]/10 dark:bg-[var(--color-celadon)]/10 text-[var(--color-teal)] dark:text-[var(--color-celadon)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {review.comment && (
                  <p className="text-[13px] text-gray-600 dark:text-sage leading-relaxed">
                    &ldquo;{review.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}