import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ConversationList } from "@/components/chat/ConversationList"
import type { ConversationListItem } from "@/components/chat/ConversationList"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const currentUserId = session.user.id

  const conversations = await db.conversation.findMany({
    where: { participants: { some: { userId: currentUserId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      listing: {
        select: {
          title: true,
          slug: true,
          images: {
            take: 1,
            orderBy: { displayOrder: "asc" },
            select: { url: true },
          },
        },
      },
      participants: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
  })

  const unreadCounts = await Promise.all(
    conversations.map((conv) => {
      const myParticipant = conv.participants.find((p) => p.userId === currentUserId)
      return db.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: currentUserId },
          ...(myParticipant?.lastReadAt
            ? { createdAt: { gt: myParticipant.lastReadAt } }
            : {}),
        },
      })
    })
  )

  const items: ConversationListItem[] = conversations.map((conv, i) => {
    const otherParticipant = conv.participants.find((p) => p.userId !== currentUserId)
    const lastMsg = conv.messages[0]

    return {
      id: conv.id,
      listing: conv.listing
        ? {
            title: conv.listing.title,
            slug: conv.listing.slug,
            imageUrl: conv.listing.images[0]?.url ?? null,
          }
        : null,
      otherUser: otherParticipant
        ? {
            id: otherParticipant.user.id,
            name: otherParticipant.user.name,
            avatarUrl: otherParticipant.user.avatarUrl,
          }
        : { id: "", name: "Usuário", avatarUrl: null },
      lastMessage: lastMsg
        ? { content: lastMsg.content, createdAt: lastMsg.createdAt.toISOString() }
        : null,
      unreadCount: unreadCounts[i],
    }
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-black text-airforce mb-4">Mensagens</h1>
      <div className="bg-white rounded-2xl border border-teal-muted/20 overflow-hidden">
        <ConversationList conversations={items} />
      </div>
    </div>
  )
}
