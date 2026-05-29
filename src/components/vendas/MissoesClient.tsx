'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type AchievementRow = {
  id: string
  title: string
  description: string
  rewardCents: number
  rewardLabel: string
  icon: string
  threshold: number
  isEarned: boolean
  earnedAt: Date | null
  progress: number
}

type Props = {
  achievements: AchievementRow[]
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
      <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

function MetaCard({ a }: { a: AchievementRow }) {
  if (a.isEarned) {
    return (
      <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--color-frosted)] dark:bg-white/4 border border-gray-100 dark:border-white/5">
        <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center flex-shrink-0 text-[22px]">
          {a.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-black text-[var(--foreground)]">{a.title}</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={10} />
              concluída
            </span>
          </div>
          <p className="text-[12px] text-gray-400 dark:text-sage mt-0.5">{a.description}</p>
          <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-2">
            +{formatPrice(a.rewardCents)} cashback recebido
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/8 border border-amber-200/60 dark:border-amber-500/15">
      <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-[22px]">
        {a.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-black text-[var(--foreground)]">{a.title}</p>
        <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">{a.description}</p>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-500 dark:text-sage">{a.progress}/{a.threshold}</span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{a.rewardLabel}</span>
          </div>
          <ProgressBar value={a.progress} max={a.threshold} />
        </div>
      </div>
    </div>
  )
}

export function MetasClient({ achievements }: Props) {
  const [tab, setTab] = useState<'ativas' | 'concluidas'>('ativas')
  const ativas = achievements.filter((a) => !a.isEarned)
  const concluidas = achievements.filter((a) => a.isEarned)

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 rounded-xl p-1">
        {(['ativas', 'concluidas'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${
              tab === t
                ? 'bg-white dark:bg-[var(--color-pine)] text-[var(--foreground)] shadow-sm'
                : 'text-gray-400 dark:text-sage hover:text-[var(--foreground)]'
            }`}
          >
            {t === 'ativas' ? 'em andamento' : `concluídas${concluidas.length > 0 ? ` (${concluidas.length})` : ''}`}
          </button>
        ))}
      </div>

      {tab === 'ativas' && (
        <div className="space-y-3">
          {ativas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[40px] mb-3">🎉</p>
              <p className="text-[16px] font-black text-[var(--foreground)]">todas as metas concluídas!</p>
              <p className="text-[13px] text-gray-400 dark:text-sage mt-1">fique de olho — novas metas chegam em breve.</p>
            </div>
          ) : (
            ativas.map((a) => <MetaCard key={a.id} a={a} />)
          )}
        </div>
      )}

      {tab === 'concluidas' && (
        <div className="space-y-3">
          {concluidas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[40px] mb-3">🏁</p>
              <p className="text-[16px] font-black text-[var(--foreground)]">nenhuma meta concluída ainda</p>
              <p className="text-[13px] text-gray-400 dark:text-sage mt-1">complete as metas em andamento para ganhar recompensas.</p>
            </div>
          ) : (
            concluidas.map((a) => <MetaCard key={a.id} a={a} />)
          )}
        </div>
      )}
    </div>
  )
}
