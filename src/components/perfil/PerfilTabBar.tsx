"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Eye, Handshake, Store, Tag, User, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabConfig = { label: string; href: string; Icon: LucideIcon }

const TABS: TabConfig[] = [
  { label: 'histórico', href: '/perfil/historico', Icon: Eye },
  { label: 'ofertas',   href: '/perfil/ofertas',   Icon: Handshake },
  { label: 'lojinhas', href: '/perfil/lojinhas',  Icon: Store },
  { label: 'marcas',   href: '/perfil/marcas',    Icon: Tag },
  { label: 'perfil',   href: '/perfil/perfil',    Icon: User },
]

export function PerfilTabBar() {
  const pathname = usePathname()

  return (
    <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden">
      {TABS.map(({ label, href, Icon }) => {
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-shrink-0 flex flex-col items-center gap-1.5 px-5 pt-3 pb-2.5 transition-colors border-b-2 whitespace-nowrap",
              isActive
                ? "text-[var(--color-pine)] dark:text-[var(--color-teal)] border-[var(--color-pine)] dark:border-[var(--color-teal)]"
                : "text-gray-400 dark:text-sage/60 border-transparent hover:text-gray-600 dark:hover:text-sage"
            )}
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2.5 : 1.8}
              className={isActive ? "fill-[var(--color-pine)]/10 dark:fill-[var(--color-teal)]/10" : ""}
            />
            <span className={cn("text-[10px] leading-none", isActive ? "font-bold" : "font-normal")}>
              {label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
