'use client'

import { useState } from 'react'
import { Coins } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'

interface Props {
  balanceCents: number
  maxApplicableCents: number
  onChange: (cents: number) => void
}

export function CashbackInput({ balanceCents, maxApplicableCents, onChange }: Props) {
  const [enabled, setEnabled] = useState(false)
  const [valueCents, setValueCents] = useState(maxApplicableCents)

  if (balanceCents <= 0 || maxApplicableCents <= 0) return null

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    onChange(checked ? valueCents : 0)
  }

  const handleSlider = (raw: number) => {
    const clamped = Math.min(raw, maxApplicableCents)
    setValueCents(clamped)
    if (enabled) onChange(clamped)
  }

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 mb-5 transition-colors',
        enabled
          ? 'border-[var(--color-teal)] bg-[var(--color-teal)]/5'
          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[var(--color-pine)]',
      )}
    >
      <label className="flex items-center justify-between cursor-pointer gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
              enabled
                ? 'bg-[var(--color-teal)] text-white'
                : 'bg-[var(--color-celadon)]/20 text-[var(--color-teal)] dark:text-[var(--color-celadon)]',
            )}
          >
            <Coins size={18} />
          </div>
          <div>
            <p className="text-[14px] font-bold text-[var(--foreground)] leading-tight">
              usar meu cashback
            </p>
            <p className="text-[12px] text-gray-500 dark:text-sage mt-0.5">
              saldo: {formatPrice(balanceCents)}
            </p>
          </div>
        </div>

        <div
          onClick={() => handleToggle(!enabled)}
          className={cn(
            'w-12 h-6 rounded-full transition-colors flex-shrink-0 relative cursor-pointer',
            enabled ? 'bg-[var(--color-teal)]' : 'bg-gray-200 dark:bg-white/10',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              enabled ? 'translate-x-6' : 'translate-x-0.5',
            )}
          />
        </div>
      </label>

      {enabled && maxApplicableCents > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-[12px]">
            <span className="text-gray-500 dark:text-sage">desconto aplicado</span>
            <span className="font-black text-[var(--color-teal)] dark:text-[var(--color-celadon)]">
              − {formatPrice(valueCents)}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={maxApplicableCents}
            value={valueCents}
            onChange={(e) => handleSlider(Number(e.target.value))}
            className="w-full accent-[var(--color-teal)]"
          />
          <div className="flex justify-between text-[11px] text-gray-400 dark:text-sage/60">
            <span>R$ 0,01</span>
            <span>{formatPrice(maxApplicableCents)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
