import type { ReactNode } from "react"
import { auth } from "@/lib/auth"
import { getUnreadCount } from "@/app/actions/chat"
import { Header } from "@/components/layout/Header"
import { BottomNav } from "@/components/layout/BottomNav"

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await auth()
  const unreadCount = session?.user?.id ? await getUnreadCount() : undefined

  return (
    <div className="flex flex-col min-h-screen bg-linen">
      <Header unreadCount={unreadCount} />
      <main className="flex-1 w-full px-4 pt-4 pb-24 md:pb-8 md:max-w-screen-xl md:mx-auto">
        {children}
      </main>
      <BottomNav unreadCount={unreadCount} />
    </div>
  )
}
