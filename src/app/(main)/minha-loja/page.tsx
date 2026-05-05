import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import Link from 'next/link'
import { PlusCircle, ArrowLeft, Star, Megaphone } from 'lucide-react'
import { MyListings } from '@/components/listing/MyListings'

export const dynamic = 'force-dynamic'

export default async function MinhaLojaPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const userId = session.user.id

  const [user, listings] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        subscription: {
          include: {
            plan: { select: { name: true, maxActiveListings: true, megaphonesPerWeek: true } },
          },
        },
        _count: { select: { listings: { where: { status: 'ACTIVE' } } } },
        reviewsReceived: { select: { rating: true } },
      },
    }),
    db.listing.findMany({
      where: { sellerId: userId },
      select: {
        id: true,
        title: true,
        slug: true,
        priceCents: true,
        status: true,
        createdAt: true,
        viewsCount: true,
        images: { orderBy: { displayOrder: 'asc' }, take: 1, select: { url: true } },
        category: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!user) redirect('/')

  const maxListings = user.subscription?.plan?.maxActiveListings ?? 15
  const activeCount = user._count.listings
  const totalRatings = user.reviewsReceived.length

  const sub = user.subscription
  const now = new Date()
  const megaphonesPerWeek = sub?.plan?.megaphonesPerWeek ?? 5
  const needsReset = !sub?.megaphonesWeekResetAt || sub.megaphonesWeekResetAt <= now
  const usedThisWeek = needsReset ? 0 : (sub?.megaphonesUsedThisWeek ?? 0)
  const planAvailable = Math.max(0, megaphonesPerWeek - usedThisWeek)
  const extraBalance = sub?.extraMegaphonesBalance ?? 0
  const totalMegaphones = planAvailable + extraBalance
  const avgRating = totalRatings > 0
    ? (user.reviewsReceived.reduce((s, r) => s + r.rating, 0) / totalRatings).toFixed(1)
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <Link
        href="/perfil/perfil"
        className="inline-flex items-center gap-2 text-[14px] font-bold text-gray-500 dark:text-sage hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft size={18} />
        voltar
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-black text-[var(--foreground)]">minha loja</h1>
          <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">
            {activeCount} de {maxListings === -1 ? '∞' : maxListings} anúncios ativos
            {user.subscription?.plan?.name ? ` · plano ${user.subscription.plan.name}` : ''}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={
                  i < Math.round(Number(avgRating ?? 0))
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-300 text-gray-300 dark:fill-white/20 dark:text-white/20'
                }
              />
            ))}
            <span className="text-[11px] text-gray-400 dark:text-sage ml-0.5">
              {avgRating !== null
                ? `${avgRating} (${totalRatings})`
                : 'sem avaliações'}
            </span>
          </div>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-1.5 px-4 py-2 bg-[var(--color-teal)] text-white text-[13px] font-bold rounded-full hover:bg-[var(--color-pine)] transition-colors"
        >
          <PlusCircle size={15} />
          novo anúncio
        </Link>
      </div>

      {/* Megaphone quota */}
      {sub && (
        <Link
          href="/vendas/megafone"
          className="flex items-center justify-between p-3.5 rounded-2xl border border-yellow-200 dark:border-yellow-500/20 bg-yellow-50 dark:bg-yellow-500/5 hover:bg-yellow-100 dark:hover:bg-yellow-500/10 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Megaphone size={16} className="text-yellow-500" />
            <div>
              <p className="text-[13px] font-black text-yellow-700 dark:text-yellow-400 leading-none">
                megafone
              </p>
              <p className="text-[11px] text-gray-500 dark:text-sage mt-0.5">
                {totalMegaphones} disponíve{totalMegaphones !== 1 ? 'is' : 'l'} esta semana
              </p>
            </div>
          </div>
          <span className="text-[22px] font-black text-yellow-600 dark:text-yellow-400">
            {totalMegaphones}
          </span>
        </Link>
      )}

      <MyListings listings={listings} />
    </div>
  )
}
