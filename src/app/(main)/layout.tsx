import { auth } from "@/lib/auth"
import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/BottomNav"
import { getUnreadCount } from "@/lib/actions/notifications"

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  const unreadCount = session?.user?.id ? await getUnreadCount() : 0

  return (
    <>
      <Header unreadCount={unreadCount} />
      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6 pb-20 md:pb-6">
        {children}
      </main>
      {/* Passando o isLoggedIn aqui! */}
      <BottomNav unreadCount={unreadCount} isLoggedIn={!!session?.user} />
    </>
  )
}