import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { NotificacoesClient } from '@/components/notificacoes/NotificacoesClient'

export default async function NotificacoesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const conversations = await db.conversation.findMany({
    where: {
      participants: { some: { userId: session.user.id } },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true, senderId: true },
      },
      listing: {
        select: {
          id: true,
          title: true,
          slug: true,
          images: {
            take: 1,
            select: { url: true },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 30,
  })

  const myId = session.user.id

  const convData = conversations.map((conv) => {
    const other = conv.participants.find((p) => p.userId !== myId)?.user
    const lastMsg = conv.messages[0]
    return {
      id: conv.id,
      otherUser: other ?? null,
      lastMessage: lastMsg?.content ?? '',
      lastMessageAt: lastMsg?.createdAt?.toISOString() ?? conv.updatedAt.toISOString(),
      isFromMe: lastMsg?.senderId === myId,
      listing: conv.listing
        ? {
            title: conv.listing.title,
            slug: conv.listing.slug,
            imageUrl: conv.listing.images[0]?.url ?? null,
          }
        : null,
    }
  })

  return <NotificacoesClient conversations={convData} />
}
