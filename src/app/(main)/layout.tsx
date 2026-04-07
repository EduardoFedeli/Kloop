import type { ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-linen">
      <Header />
      <main className="flex-1 w-full px-4 pt-4 pb-24 md:pb-8 md:max-w-screen-xl md:mx-auto">{children}</main>
      <BottomNav />
    </div>
  )
}
