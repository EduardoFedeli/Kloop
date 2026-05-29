import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import { getUserAchievementsData } from '@/lib/actions/achievements'
import { MetasClient } from '@/components/vendas/MissoesClient'

export default async function MetasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const achievements = await getUserAchievementsData(session.user.id)
  const completed = achievements.filter((a) => a.isEarned).length
  const total = achievements.length

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-lg mx-auto px-4 pb-20">

        <div className="flex items-center gap-3 py-5">
          <Link
            href="/vendas"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-sage hover:bg-gray-200 dark:hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[19px] font-black text-[var(--foreground)] leading-tight">metas</h1>
            <p className="text-[12px] text-gray-400 dark:text-sage">{completed}/{total} concluídas</p>
          </div>
        </div>

        <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/8 border border-amber-200/60 dark:border-amber-500/15 p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[15px] font-black text-[var(--foreground)]">recompensas</p>
            <p className="text-[12px] text-gray-500 dark:text-sage leading-relaxed mt-0.5">
              complete metas e ganhe cashback. o saldo cai direto na sua carteira.
            </p>
          </div>
        </div>

        <MetasClient achievements={achievements} />
      </div>
    </div>
  )
}
