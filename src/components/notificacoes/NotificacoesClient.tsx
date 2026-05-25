'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, Heart, Tag, ShoppingBag, HelpCircle, MessageSquare, TrendingDown, Handshake } from 'lucide-react'
import { cn } from '@/lib/utils'
import { markAsRead, markAllAsRead } from '@/lib/actions/notifications'
import type { NotificationType } from '@prisma/client'

type NotificationItem = {
  id: string
  type: NotificationType
  title: string
  content: string
  isRead: boolean
  actionUrl: string | null
  createdAt: string
}

type Props = { notifications: NotificationItem[] }

type Filter = 'todas' | 'nao-lidas'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'nao-lidas', label: 'Não lidas' },
]

function NotificationIcon({ type }: { type: NotificationType }) {
  const props = { size: 18, strokeWidth: 1.8 }
  switch (type) {
    case 'LIKE':           return <Heart {...props} />
    case 'OFFER':          return <Tag {...props} />
    case 'BUNDLE_OFFER':   return <ShoppingBag {...props} />
    case 'SALE_COMPLETED': return <Check {...props} />
    case 'QUESTION':       return <HelpCircle {...props} />
    case 'ANSWER':         return <MessageSquare {...props} />
    case 'PRICE_DROP':     return <TrendingDown {...props} />
    case 'OFFER_ACCEPTED': return <Handshake {...props} />
    default:               return <Bell {...props} />
  }
}

function iconBg(type: NotificationType): string {
  switch (type) {
    case 'LIKE':           return 'bg-rose-100 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400'
    case 'OFFER':          return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
    case 'BUNDLE_OFFER':   return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    case 'SALE_COMPLETED': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'QUESTION':       return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    case 'ANSWER':         return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
    case 'PRICE_DROP':     return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
    case 'OFFER_ACCEPTED': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
    default:               return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
  }
}

export function NotificacoesClient({ notifications }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('todas')
  const [isPending, startTransition] = useTransition()

  const [optimisticItems, updateOptimistic] = useOptimistic(
    notifications,
    (state: NotificationItem[], action: { type: 'read-one'; id: string } | { type: 'read-all' }) => {
      if (action.type === 'read-all') return state.map((n) => ({ ...n, isRead: true }))
      return state.map((n) => (n.id === action.id ? { ...n, isRead: true } : n))
    },
  )

  const displayed = filter === 'nao-lidas'
    ? optimisticItems.filter((n) => !n.isRead)
    : optimisticItems

  const hasUnread = optimisticItems.some((n) => !n.isRead)

  function handleMarkAll() {
    startTransition(async () => {
      updateOptimistic({ type: 'read-all' })
      await markAllAsRead()
    })
  }

  function handleItemClick(item: NotificationItem) {
    startTransition(async () => {
      if (!item.isRead) {
        updateOptimistic({ type: 'read-one', id: item.id })
        await markAsRead(item.id)
      }
      if (item.actionUrl) router.push(item.actionUrl)
    })
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-4 px-0.5">
        <h1 className="text-xl font-black text-gray-900 dark:text-frosted">notificações</h1>
        {hasUnread && (
          <button
            onClick={handleMarkAll}
            disabled={isPending}
            className="text-xs font-semibold text-[var(--color-teal)] dark:text-[var(--color-celadon)] disabled:opacity-50 transition-opacity"
          >
            marcar todas como lidas
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex border-b border-gray-200 dark:border-emerald mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-colors',
              filter === f.key
                ? 'text-teal dark:text-celadon border-b-2 border-teal dark:border-celadon -mb-px'
                : 'text-gray-400 dark:text-sage hover:text-gray-600',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400 dark:text-sage">
          <Bell size={48} strokeWidth={1} />
          <div className="text-center">
            <p className="font-semibold text-gray-600 dark:text-sage">nenhuma novidade por aqui</p>
            <p className="text-sm mt-1">quando algo acontecer, aparece aqui</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-1">
          {displayed.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-2xl text-left transition-colors',
                  item.isRead
                    ? 'hover:bg-gray-50 dark:hover:bg-white/5'
                    : 'bg-[var(--color-celadon)]/10 dark:bg-white/5 hover:bg-[var(--color-celadon)]/20 dark:hover:bg-white/10',
                )}
              >
                {/* Ícone */}
                <div className={cn('flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5', iconBg(item.type))}>
                  <NotificationIcon type={item.type} />
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn('text-sm truncate', item.isRead ? 'font-medium text-gray-800 dark:text-frosted/80' : 'font-bold text-gray-900 dark:text-frosted')}>
                      {item.title}
                    </p>
                    {!item.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[var(--color-teal)] dark:bg-[var(--color-celadon)]" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-sage mt-0.5 line-clamp-2">{item.content}</p>
                  <p className="text-[10px] text-gray-400 dark:text-sage/60 mt-1">{formatRelative(item.createdAt)}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function formatRelative(isoString: string): string {
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'agora'
    if (diffMin < 60) return `${diffMin}m atrás`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h atrás`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD}d atrás`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}
