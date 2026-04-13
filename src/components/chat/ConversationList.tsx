"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { cn, timeAgo } from "@/lib/utils"

export type ConversationListItem = {
  id: string
  listing: {
    title: string
    slug: string
    imageUrl: string | null
  } | null
  otherUser: {
    id: string
    name: string
    avatarUrl: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
  } | null
  unreadCount: number
}

type Props = {
  conversations: ConversationListItem[]
}

export function ConversationList({ conversations }: Props) {
  const router = useRouter()

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <MessageCircle size={48} className="text-teal-muted/40" />
        <p className="text-gray-500 text-sm max-w-xs">
          Nenhuma conversa ainda. Encontre um produto e converse com o vendedor!
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-teal text-linen text-sm font-bold hover:bg-airforce transition-colors"
        >
          Explorar produtos
        </Link>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-teal-muted/10">
      {conversations.map((conv) => {
        const initials = conv.otherUser.name.substring(0, 2).toUpperCase()

        return (
          <li key={conv.id}>
            <button
              onClick={() => router.push(`/chat/${conv.id}`)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 hover:bg-celadon/20 transition-colors text-left",
                conv.unreadCount > 0 && "bg-celadon/10"
              )}
            >
              {/* Thumb do produto */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-celadon/30 shrink-0">
                {conv.listing?.imageUrl ? (
                  <Image
                    src={conv.listing.imageUrl}
                    alt={conv.listing.title ?? "Produto"}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MessageCircle size={16} className="text-teal-muted" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold text-airforce truncate",
                      conv.unreadCount > 0 && "font-bold"
                    )}
                  >
                    {conv.otherUser.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {conv.lastMessage && (
                      <span className="text-[10px] text-teal-muted">
                        {timeAgo(conv.lastMessage.createdAt)}
                      </span>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {conv.listing?.title && (
                    <span className="text-teal-muted font-medium mr-1">
                      {conv.listing.title} ·
                    </span>
                  )}
                  {conv.lastMessage?.content ?? "Nenhuma mensagem ainda"}
                </p>
              </div>

              {/* Avatar do outro usuário */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-celadon/30 shrink-0">
                {conv.otherUser.avatarUrl ? (
                  <Image
                    src={conv.otherUser.avatarUrl}
                    alt={conv.otherUser.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-airforce">
                    {initials}
                  </div>
                )}
              </div>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
