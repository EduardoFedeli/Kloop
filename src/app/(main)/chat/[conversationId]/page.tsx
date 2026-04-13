import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { markAsRead } from "@/app/actions/chat"
import { ChatWindow } from "@/components/chat/ChatWindow"

interface Props {
  params: Promise<{ conversationId: string }>
}

export default async function ConversationPage({ params }: Props) {
  const { conversationId } = await params
  const session = await auth()

  if (!session?.user?.id) redirect("/login")

  const currentUserId = session.user.id

  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: currentUserId },
    },
  })

  if (!participant) redirect("/chat")

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
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
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          conversationId: true,
          senderId: true,
          content: true,
          createdAt: true,
        },
      },
    },
  })

  if (!conversation) redirect("/chat")

  const otherParticipant = conversation.participants.find((p) => p.userId !== currentUserId)
  if (!otherParticipant) redirect("/chat")

  await markAsRead(conversationId)

  const listing = conversation.listing
    ? {
        title: conversation.listing.title,
        slug: conversation.listing.slug,
        imageUrl: conversation.listing.images[0]?.url ?? null,
      }
    : null

  const otherUser = {
    name: otherParticipant.user.name,
    avatarUrl: otherParticipant.user.avatarUrl,
  }

  const messages = conversation.messages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <div className="-mx-4 -mt-4 flex flex-col" style={{ height: "calc(100dvh - 120px)" }}>
      <ChatWindow
        messages={messages}
        currentUserId={currentUserId}
        conversationId={conversationId}
        listing={listing}
        otherUser={otherUser}
      />
    </div>
  )
}
