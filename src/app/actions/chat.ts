"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export type StartConversationResult = { conversationId: string } | { error: string }
export type SendMessageResult = { success: true } | { error: string }

export async function startConversation(listingId: string): Promise<StartConversationResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "unauthenticated" }

  const listing = await db.listing.findUnique({
    where: { id: listingId },
    select: { sellerId: true, status: true },
  })
  if (!listing) return { error: "listing_not_found" }
  if (listing.status !== "ACTIVE") return { error: "listing_not_available" }

  const currentUserId = session.user.id
  const sellerId = listing.sellerId

  if (currentUserId === sellerId) return { error: "cannot_chat_with_self" }

  const conversation = await db.$transaction(async (tx) => {
    const existing = await tx.conversation.findFirst({
      where: {
        listingId,
        AND: [
          { participants: { some: { userId: currentUserId } } },
          { participants: { some: { userId: sellerId } } },
        ],
      },
      select: { id: true },
    })
    if (existing) return existing
    return tx.conversation.create({
      data: {
        listingId,
        participants: {
          create: [{ userId: currentUserId }, { userId: sellerId }],
        },
      },
      select: { id: true },
    })
  })

  return { conversationId: conversation.id }
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<SendMessageResult> {
  const session = await auth()
  if (!session?.user?.id) return { error: "unauthenticated" }

  const trimmed = content.trim()
  if (!trimmed) return { error: "empty_content" }
  if (trimmed.length > 2000) return { error: "content_too_long" }

  const participant = await db.conversationParticipant.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
  })
  if (!participant) return { error: "not_participant" }

  await db.$transaction([
    db.message.create({
      data: { conversationId, senderId: session.user.id, content: trimmed },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ])

  return { success: true }
}

export async function markAsRead(conversationId: string): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  await db.conversationParticipant.updateMany({
    where: { conversationId, userId: session.user.id },
    data: { lastReadAt: new Date() },
  })
}

export async function getUnreadCount(): Promise<number> {
  const session = await auth()
  if (!session?.user?.id) return 0

  const currentUserId = session.user.id

  const participants = await db.conversationParticipant.findMany({
    where: { userId: currentUserId },
    select: { conversationId: true, lastReadAt: true },
  })

  if (participants.length === 0) return 0

  const counts = await Promise.all(
    participants.map((p) =>
      db.message.count({
        where: {
          conversationId: p.conversationId,
          senderId: { not: currentUserId },
          ...(p.lastReadAt ? { createdAt: { gt: p.lastReadAt } } : {}),
        },
      })
    )
  )

  return counts.reduce((sum, n) => sum + n, 0)
}
