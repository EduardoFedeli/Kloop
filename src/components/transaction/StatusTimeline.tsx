'use client'

import { cn } from '@/lib/utils'
import { Check, Clock } from 'lucide-react'
import type { TransactionStatus } from '@prisma/client'

const STEPS: { status: TransactionStatus; label: string; description: string }[] = [
  { status: 'PENDING', label: 'Pedido realizado', description: 'aguardando pagamento' },
  { status: 'PAID', label: 'Pagamento confirmado', description: 'vendedor preparando envio' },
  { status: 'SHIPPED', label: 'Enviado', description: 'a caminho do destino' },
  { status: 'DELIVERED', label: 'Entregue', description: 'aguardando confirmação' },
  { status: 'COMPLETED', label: 'Concluído', description: 'venda finalizada' },
]

const STATUS_ORDER: Partial<Record<TransactionStatus, number>> = {
  PENDING: 0,
  PAID: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  COMPLETED: 4,
}

interface Props {
  currentStatus: TransactionStatus
}

export function StatusTimeline({ currentStatus }: Props) {
  const currentOrder = STATUS_ORDER[currentStatus] ?? -1

  if (currentStatus === 'CANCELLED') {
    return (
      <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-white/5 rounded-2xl">
        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-white/20 flex items-center justify-center flex-shrink-0">
          <span className="text-gray-500 text-sm font-bold">✕</span>
        </div>
        <div>
          <p className="text-[14px] font-bold text-gray-500 dark:text-sage">Pedido cancelado</p>
          <p className="text-[12px] text-gray-400 dark:text-sage/60">esta transação foi cancelada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {STEPS.map((step, index) => {
        const stepOrder = STATUS_ORDER[step.status] ?? 0
        const isDone = currentOrder > stepOrder
        const isActive = currentOrder === stepOrder
        const isPending = currentOrder < stepOrder
        const isLast = index === STEPS.length - 1

        return (
          <div key={step.status} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors',
                  isDone && 'bg-[var(--color-teal)] border-[var(--color-teal)]',
                  isActive &&
                    'bg-white dark:bg-[var(--color-pine)] border-[var(--color-teal)] shadow-md',
                  isPending &&
                    'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10',
                )}
              >
                {isDone ? (
                  <Check size={14} className="text-white" strokeWidth={3} />
                ) : isActive ? (
                  <Clock size={14} className="text-[var(--color-teal)]" strokeWidth={2.5} />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 h-8 mt-0.5',
                    isDone ? 'bg-[var(--color-teal)]' : 'bg-gray-200 dark:bg-white/10',
                  )}
                />
              )}
            </div>

            <div className="pb-6">
              <p
                className={cn(
                  'text-[14px] font-bold leading-none',
                  isDone &&
                    'text-[var(--color-teal)] dark:text-[var(--color-celadon)]',
                  isActive && 'text-[var(--foreground)]',
                  isPending && 'text-gray-400 dark:text-sage/50',
                )}
              >
                {step.label}
              </p>
              <p
                className={cn(
                  'text-[12px] mt-0.5',
                  isActive
                    ? 'text-gray-500 dark:text-sage'
                    : 'text-gray-300 dark:text-sage/30',
                )}
              >
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
