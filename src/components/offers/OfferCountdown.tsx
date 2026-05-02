'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'expirado'
  const totalSecs = Math.floor(ms / 1000)
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export function OfferCountdown({ expiresAt }: { expiresAt: Date }) {
  const [remaining, setRemaining] = useState(() => expiresAt.getTime() - Date.now())

  useEffect(() => {
    const id = setInterval(() => setRemaining(expiresAt.getTime() - Date.now()), 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const isLow = remaining < 3 * 60 * 60 * 1000

  return (
    <span className={`inline-flex items-center gap-1 text-[12px] font-bold ${isLow ? 'text-red-500' : 'text-gray-400 dark:text-sage'}`}>
      <Clock size={12} />
      expira em {formatRemaining(remaining)}
    </span>
  )
}
