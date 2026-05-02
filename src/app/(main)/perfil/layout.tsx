import { PerfilTabBar } from '@/components/perfil/PerfilTabBar'

export default function PerfilLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 -mt-6 min-h-screen bg-[var(--background)]">
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-gray-100 dark:border-white/5">
        <PerfilTabBar />
      </div>
      <div className="px-4 pt-5 pb-32">
        {children}
      </div>
    </div>
  )
}
