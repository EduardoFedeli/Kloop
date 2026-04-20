"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, Tag, Bell, User, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  hasBadge?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { href: "/",              label: "home",          icon: Home },
  { href: "/search",        label: "buscar",        icon: Search },
  { href: "/vendas",        label: "vendas",        icon: Tag },
  { href: "/notificacoes",  label: "notificações",  icon: Bell,  hasBadge: true },
  { href: "/perfil",        label: "meu kloop",     icon: User },
] as const

type Props = { unreadCount?: number }

export function BottomNav({ unreadCount }: Props) {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-pine border-t border-gray-100 dark:border-forest safe-area-inset-bottom">
      <ul className="flex items-stretch justify-around px-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, hasBadge }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href)

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 px-1 w-full transition-colors",
                  isActive
                    ? "text-teal dark:text-celadon"
                    : "text-gray-400 dark:text-sage hover:text-teal dark:hover:text-celadon",
                )}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? "fill-teal/10 dark:fill-celadon/10" : ""}
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
                    isActive ? "font-bold" : "font-normal",
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
  )
}
