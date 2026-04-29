import { Coins, AlertTriangle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Props {
  balanceCents: number
  expiringSoonCents: number
  expiryDays: number
}

export function CashbackBalanceCard({ balanceCents, expiringSoonCents, expiryDays }: Props) {
  return (
    <div className="rounded-2xl bg-[var(--color-celadon)]/15 dark:bg-[var(--color-celadon)]/10 border border-[var(--color-celadon)]/40 dark:border-[var(--color-celadon)]/20 p-5">
      <div className="flex items-center gap-2 mb-1">
        <Coins size={16} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
        <p className="text-[12px] font-bold uppercase tracking-widest text-[var(--color-teal)] dark:text-[var(--color-celadon)]">
          meu cashback
        </p>
      </div>

      <p className="text-[36px] font-black text-[var(--foreground)] leading-none mt-2">
        {formatPrice(balanceCents)}
      </p>
      <p className="text-[13px] text-gray-500 dark:text-sage mt-1">saldo disponível</p>

      {expiringSoonCents > 0 && (
        <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl px-3 py-2">
          <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-snug">
            <span className="font-bold">{formatPrice(expiringSoonCents)}</span> vencem em{' '}
            {expiryDays} dias. Use antes que expire!
          </p>
        </div>
      )}
    </div>
  )
}
