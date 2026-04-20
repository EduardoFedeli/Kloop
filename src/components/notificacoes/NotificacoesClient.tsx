'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, MessageCircle, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

type ConvItem = {
  id: string
  otherUser: { id: string; name: string | null; avatarUrl: string | null } | null
  lastMessage: string
  lastMessageAt: string
  isFromMe: boolean
  listing: { title: string; slug: string; imageUrl: string | null } | null
}

type Props = { conversations: ConvItem[] }

const TABS = [
  { key: 'negociacoes', label: 'negociações' },
  { key: 'mensagens',   label: 'mensagens' },
] as const

export function NotificacoesClient({ conversations }: Props) {
  const [active, setActive] = useState<'negociacoes' | 'mensagens'>('negociacoes')

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-1 px-0.5">
        <h1 className="text-xl font-black text-gray-900 dark:text-frosted">notificações</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-emerald mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              'flex-1 py-3 text-sm font-semibold transition-colors',
              active === tab.key
                ? 'text-teal dark:text-celadon border-b-2 border-teal dark:border-celadon -mb-px'
                : 'text-gray-400 dark:text-sage hover:text-gray-600',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Negociações */}
      {active === 'negociacoes' && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400 dark:text-sage">
          <Bell size={48} strokeWidth={1} />
          <div className="text-center">
            <p className="font-semibold text-gray-600 dark:text-sage">nenhuma novidade por aqui</p>
            <p className="text-sm mt-1">quando algo acontecer, aparece aqui</p>
          </div>
        </div>
      )}

      {/* Mensagens */}
      {active === 'mensagens' && (
        <div className="space-y-1">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400 dark:text-sage">
              <MessageCircle size={48} strokeWidth={1} />
              <div className="text-center">
                <p className="font-semibold text-gray-600 dark:text-sage">nenhuma mensagem ainda</p>
                <p className="text-sm mt-1">suas conversas vão aparecer aqui</p>
              </div>
            </div>
          ) : (
            conversations.map((conv) => {
              const initials = conv.otherUser?.name?.substring(0, 2).toUpperCase() ?? '??'
              const timeAgo = formatRelative(conv.lastMessageAt)

              return (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-emerald/30 transition-colors"
                >
                  {/* Avatar ou thumbnail */}
                  {conv.listing?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conv.listing.imageUrl}
                      alt={conv.listing.title}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : conv.otherUser?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={conv.otherUser.avatarUrl}
                      alt={conv.otherUser.name ?? ''}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-celadon to-teal flex items-center justify-center text-linen font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                  )}

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-gray-900 dark:text-frosted truncate">
                        {conv.listing?.title ?? conv.otherUser?.name ?? 'conversa'}
                      </p>
                      <span className="text-[10px] text-gray-400 dark:text-sage flex-shrink-0">{timeAgo}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-sage truncate mt-0.5">
                      {conv.isFromMe ? 'você: ' : ''}{conv.lastMessage}
                    </p>
                    {conv.otherUser && (
                      <p className="text-[10px] text-gray-400 dark:text-sage/60 mt-0.5">
                        {conv.otherUser.name}
                      </p>
                    )}
                  </div>

                  {/* Ícone */}
                  <Package size={16} className="text-gray-300 dark:text-sage/40 flex-shrink-0" />
                </Link>
              )
            })
          )}
        </div>
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
    if (diffMin < 60) return `${diffMin}m`
    const diffH = Math.floor(diffMin / 60)
    if (diffH < 24) return `${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD < 7) return `${diffD}d`
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  } catch {
    return ''
  }
}
