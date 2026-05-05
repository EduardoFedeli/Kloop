import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { MegafoneClient } from '@/components/megafone/MegafoneClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Megafone | Kloop',
}

export default async function MegafonePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id

  const [sub, listings] = await Promise.all([
    db.userSubscription.findUnique({
      where: { userId },
      include: { plan: { select: { megaphonesPerWeek: true, name: true } } },
    }),
    db.listing.findMany({
      where: { sellerId: userId, status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        slug: true,
        priceCents: true,
        createdAt: true,
        isMegafonado: true,
        megafonadoUntil: true,
        images: { orderBy: { displayOrder: 'asc' }, take: 1, select: { url: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  if (!sub) redirect('/pro')

  const now = new Date()
  const megaphonesPerWeek = sub.plan?.megaphonesPerWeek ?? 5
  const needsReset = !sub.megaphonesWeekResetAt || sub.megaphonesWeekResetAt <= now
  const usedThisWeek = needsReset ? 0 : sub.megaphonesUsedThisWeek
  const planAvailable = Math.max(0, megaphonesPerWeek - usedThisWeek)
  const extraBalance = sub.extraMegaphonesBalance
  const totalAvailable = planAvailable + extraBalance

  const quota = {
    planAvailable,
    extraBalance,
    totalAvailable,
    resetAt: sub.megaphonesWeekResetAt,
    megaphonesPerWeek,
    usedThisWeek,
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <Link
        href="/vendas"
        className="inline-flex items-center gap-2 text-[14px] font-bold text-gray-500 dark:text-sage hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft size={18} />
        voltar
      </Link>

      <div>
        <h1 className="text-[20px] font-black text-[var(--foreground)]">megafone</h1>
        <p className="text-[13px] text-gray-500 dark:text-sage mt-0.5">
          impulsione seus anúncios e apareça pra mais gente
        </p>
      </div>

      <MegafoneClient
        listings={listings}
        quota={quota}
        planName={sub.plan?.name ?? 'Basic'}
      />
    </div>
  )
}
