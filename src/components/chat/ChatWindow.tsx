"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { toast } from "sonner"
import { sendMessage, markAsRead } from "@/app/actions/chat"
import { cn } from "@/lib/utils"

export type SerializedMessage = {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

type Props = {
  messages: SerializedMessage[]
  currentUserId: string
  conversationId: string
  listing: { title: string; slug: string; imageUrl: string | null } | null
  otherUser: { name: string; avatarUrl: string | null }
}

function formatTime(dateStr: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr))
}

function formatDaySeparator(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Hoje"
  if (date.toDateString() === yesterday.toDateString()) return "Ontem"
  return new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" }).format(date)
}

type MessageItem =
  | { type: "separator"; date: string }
  | { type: "message"; data: SerializedMessage }

export function ChatWindow({
  messages: initialMessages,
  currentUserId,
  conversationId,
  listing,
  otherUser,
}: Props) {
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastServerMsgRef = useRef<SerializedMessage[]>(initialMessages)

  const [serverMessages, setServerMessages] = useState<SerializedMessage[]>(initialMessages)
  const [pendingMessages, setPendingMessages] = useState<SerializedMessage[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)

  const allMessages = useMemo(
    () => [...serverMessages, ...pendingMessages],
    [serverMessages, pendingMessages]
  )

  const messagesWithSeparators = useMemo((): MessageItem[] => {
    const result: MessageItem[] = []
    let lastDateStr = ""

    for (const msg of allMessages) {
      const dateStr = new Date(msg.createdAt).toDateString()
      if (dateStr !== lastDateStr) {
        result.push({ type: "separator", date: msg.createdAt })
        lastDateStr = dateStr
      }
      result.push({ type: "message", data: msg })
    }
    return result
  }, [allMessages])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [allMessages, scrollToBottom])

  // Keep ref updated for polling
  useEffect(() => {
    lastServerMsgRef.current = serverMessages
  }, [serverMessages])

  // Polling every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      if (document.hidden) return
      const msgs = lastServerMsgRef.current
      const last = msgs[msgs.length - 1]
      const after = last?.createdAt ?? new Date(0).toISOString()

      try {
        const res = await fetch(
          `/api/chat/${conversationId}/messages?after=${encodeURIComponent(after)}`
        )
        if (!res.ok) return
        const newMsgs: SerializedMessage[] = await res.json()
        if (newMsgs.length === 0) return

        setServerMessages((prev) => [...prev, ...newMsgs])

        // Remove pending messages confirmed by the server
        setPendingMessages((prev) =>
          prev.filter(
            (pending) =>
              !newMsgs.some(
                (msg) =>
                  msg.senderId === currentUserId &&
                  msg.content === pending.content &&
                  Math.abs(
                    new Date(msg.createdAt).getTime() - new Date(pending.createdAt).getTime()
                  ) < 15000
              )
          )
        )

        scrollToBottom()
        await markAsRead(conversationId)
      } catch {
        // Silently ignore polling errors
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [conversationId, currentUserId, scrollToBottom])

  const handleSend = useCallback(async () => {
    const content = input.trim()
    if (!content || isSending) return

    const tempId = `pending-${Date.now()}`
    const pending: SerializedMessage = {
      id: tempId,
      conversationId,
      senderId: currentUserId,
      content,
      createdAt: new Date().toISOString(),
    }

    setIsSending(true)
    setPendingMessages((prev) => [...prev, pending])
    setInput("")

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    try {
      const result = await sendMessage(conversationId, content)
      if ("error" in result) {
        setPendingMessages((prev) => prev.filter((m) => m.id !== tempId))
        toast.error("Erro ao enviar mensagem. Tente novamente.")
      }
    } finally {
      setIsSending(false)
    }
  }, [input, isSending, conversationId, currentUserId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px"
  }

  const otherUserInitials = otherUser.name.substring(0, 2).toUpperCase()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-teal-muted/20 shadow-sm px-3 py-2 flex items-center gap-3 shrink-0">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-full hover:bg-celadon/30 transition-colors text-airforce"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>

        {listing && (
          <Link href={`/listing/${listing.slug}`} className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-celadon/30 shrink-0">
              {listing.imageUrl ? (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-celadon/30" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-airforce truncate leading-tight">
                {listing.title}
              </p>
              <p className="text-[10px] text-teal-muted">{otherUser.name}</p>
            </div>
          </Link>
        )}

        {!listing && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-airforce truncate">{otherUser.name}</p>
          </div>
        )}

        {/* Avatar do outro usuário */}
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-celadon/30 shrink-0">
          {otherUser.avatarUrl ? (
            <Image
              src={otherUser.avatarUrl}
              alt={otherUser.name}
              fill
              sizes="36px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-airforce">
              {otherUserInitials}
            </div>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1" style={{ background: "rgba(241,241,230,0.5)" }}>
        {messagesWithSeparators.map((item, i) => {
          if (item.type === "separator") {
            return (
              <div key={`sep-${i}`} className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-teal-muted/20" />
                <span className="text-[10px] text-teal-muted font-medium px-1">
                  {formatDaySeparator(item.date)}
                </span>
                <div className="flex-1 h-px bg-teal-muted/20" />
              </div>
            )
          }

          const msg = item.data
          const isOwn = msg.senderId === currentUserId
          const isPending = msg.id.startsWith("pending-")

          return (
            <div
              key={msg.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[75%] px-3.5 py-2 rounded-2xl",
                  isOwn
                    ? "bg-teal text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-teal-muted/10",
                  isPending && "opacity-70"
                )}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={cn(
                    "text-[10px] mt-0.5 text-right",
                    isOwn ? "text-white/60" : "text-gray-400"
                  )}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white border-t border-teal-muted/20 px-3 py-2 flex items-end gap-2 shrink-0">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          rows={1}
          className="flex-1 resize-none rounded-2xl border border-teal-muted/30 bg-linen/50 px-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-teal transition-colors"
          style={{ maxHeight: "96px" }}
        />
        <button
          onClick={() => void handleSend()}
          disabled={!input.trim() || isSending}
          className="w-9 h-9 rounded-full bg-teal text-white flex items-center justify-center hover:bg-airforce transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Enviar mensagem"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
