import { cn } from '@/lib/utils'
import type { OfferStatus } from '@prisma/client'

const CONFIG: Record<OfferStatus, { label: string; className: string }> = {
  PENDING_SELLER: { label: 'aguardando vendedor', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  PENDING_BUYER:  { label: 'aguardando comprador', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  ACCEPTED:       { label: 'aceita', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  REJECTED:       { label: 'recusada', className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  EXPIRED:        { label: 'expirada', className: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-sage' },
  CANCELLED:      { label: 'cancelada', className: 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-sage' },
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const { label, className } = CONFIG[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide', className)}>
      {label}
    </span>
  )
}
