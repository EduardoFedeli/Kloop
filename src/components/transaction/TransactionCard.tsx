import Link from 'next/link'
import Image from 'next/image'
import { cn, formatPrice, formatDate } from '@/lib/utils'
import type { TransactionStatus } from '@prisma/client'

const STATUS_CONFIG: Record<
  TransactionStatus,
  { label: string; bgClass: string; textClass: string }
> = {
  PENDING: {
    label: 'aguardando pagamento',
    bgClass: 'bg-orange-50 dark:bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
  },
  AWAITING_PAYMENT: {
    label: 'aguardando pagamento',
    bgClass: 'bg-orange-50 dark:bg-orange-500/10',
    textClass: 'text-orange-600 dark:text-orange-400',
  },
  PAID: {
    label: 'pagamento confirmado',
    bgClass: 'bg-yellow-50 dark:bg-yellow-500/10',
    textClass: 'text-yellow-700 dark:text-yellow-400',
  },
  SHIPPED: {
    label: 'a caminho',
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
    textClass: 'text-blue-600 dark:text-blue-400',
  },
  DELIVERED: {
    label: 'entregue',
    bgClass: 'bg-emerald-50 dark:bg-emerald-500/10',
    textClass: 'text-emerald-600 dark:text-emerald-400',
  },
  COMPLETED: {
    label: 'concluído',
    bgClass: 'bg-gray-100 dark:bg-white/5',
    textClass: 'text-gray-500 dark:text-sage',
  },
  CANCELLED: {
    label: 'cancelado',
    bgClass: 'bg-gray-100 dark:bg-white/5',
    textClass: 'text-gray-400 dark:text-sage/50',
  },
  REFUNDED: {
    label: 'reembolsado',
    bgClass: 'bg-gray-100 dark:bg-white/5',
    textClass: 'text-gray-400 dark:text-sage/50',
  },
  DISPUTED: {
    label: 'em disputa',
    bgClass: 'bg-red-50 dark:bg-red-500/10',
    textClass: 'text-red-600 dark:text-red-400',
  },
}

interface Props {
  id: string
  href: string
  imageUrl?: string
  title: string
  amountCents: number
  status: TransactionStatus
  createdAt: Date | string
  subtitle?: string
}

export function TransactionCard({
  href,
  imageUrl,
  title,
  amountCents,
  status,
  createdAt,
  subtitle,
}: Props) {
  const config = STATUS_CONFIG[status]

  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white dark:bg-[var(--color-pine)] rounded-2xl border border-gray-100 dark:border-white/5 p-3 hover:border-[var(--color-teal)]/30 transition-colors"
    >
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl">📦</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[var(--foreground)] truncate leading-tight">
          {title}
        </p>
        <p className="text-[13px] font-black text-[var(--color-airforce)] dark:text-[var(--color-celadon)] mt-0.5">
          {formatPrice(amountCents)}
        </p>
        {subtitle && (
          <p className="text-[11px] text-gray-400 dark:text-sage/60 mt-0.5 truncate">{subtitle}</p>
        )}
        <p className="text-[11px] text-gray-400 dark:text-sage/60 mt-0.5">
          {formatDate(createdAt)}
        </p>
      </div>

      <div className="flex-shrink-0">
        <span
          className={cn(
            'text-[11px] font-bold px-2.5 py-1 rounded-full',
            config.bgClass,
            config.textClass,
          )}
        >
          {config.label}
        </span>
      </div>
    </Link>
  )
}
