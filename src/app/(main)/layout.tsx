import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Conta conversas com mensagens não lidas (lastReadAt null = nunca leu)
  const unreadCount = session?.user?.id
    ? await db.conversationParticipant.count({
        where: {
          userId: session.user.id,
          lastReadAt: null,
          conversation: {
            messages: {
              some: { senderId: { not: session.user.id } },
            },
          },
        },
      })
    : 0

  return (
    <>
      <Header unreadCount={unreadCount} />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      <BottomNav unreadCount={unreadCount} />
    </>
  )
}
