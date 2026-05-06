"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Bell, User, PlusCircle, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthModal } from "@/components/auth/AuthModal"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  hasBadge?: boolean
  requiresAuth?: boolean
  isAction?: boolean // Destacar o botão de vender
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",          label: "home",         icon: Home },
  { href: "/search",        label: "buscar",       icon: Search },
  { href: "/vendas",        label: "vender",       icon: PlusCircle, requiresAuth: true, isAction: true },
  { href: "/notificacoes",  label: "notificações", icon: Bell, hasBadge: true, requiresAuth: true },
  { href: "/perfil",        label: "meu kloop",    icon: User, requiresAuth: true },
] as const

type Props = { unreadCount?: number; isLoggedIn?: boolean }

export function BottomNav({ unreadCount, isLoggedIn = false }: Props) {
  const pathname = usePathname()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[var(--color-pine)] border-t border-gray-100 dark:border-[var(--color-forest)] safe-area-inset-bottom">
        <ul className="flex items-stretch justify-around px-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, hasBadge, requiresAuth, isAction }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)

            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  onClick={(e) => {
                    if (requiresAuth && !isLoggedIn) {
                      e.preventDefault()
                      setIsModalOpen(true)
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2 w-full transition-colors",
                    isActive
                      ? "text-[var(--color-teal)] dark:text-[var(--color-celadon)]"
                      : "text-gray-400 dark:text-[var(--color-sage)] hover:text-[var(--color-teal)] dark:hover:text-[var(--color-celadon)]",
                  )}
                >
                  <div className={cn("relative", isAction && "text-[var(--color-teal)] dark:text-[var(--color-celadon)]")}>
                    <Icon
                      size={isAction ? 28 : 22} // Aumenta o tamanho do botão central
                      strokeWidth={isActive || isAction ? 2.5 : 1.8}
                      className={isActive ? "fill-[var(--color-teal)]/10 dark:fill-[var(--color-celadon)]/10" : ""}
                    />
                    {hasBadge && unreadCount && unreadCount > 0 ? (
                      <span className="absolute -top-1 -right-1.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] leading-none",
                      isActive || isAction ? "font-bold" : "font-normal",
                    )}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <AuthModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}