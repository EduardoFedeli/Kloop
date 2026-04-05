'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, Bookmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: React.ReactNode
  highlight?: boolean
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: <Home size={22} /> },
  { href: '/buscar', label: 'Buscar', icon: <Search size={22} /> },
  { href: '/create', label: 'Criar', icon: <PlusCircle size={26} />, highlight: true },
  { href: '/salvos', label: 'Salvos', icon: <Bookmark size={22} /> },
  { href: '/perfil', label: 'Perfil', icon: <User size={22} /> },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-linen border-t border-teal-muted/30">
      <ul className="max-w-screen-lg mx-auto flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-label={item.label}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors',
                  item.highlight
                    ? 'text-linen bg-teal rounded-2xl px-4 py-2'
                    : isActive
                      ? 'text-airforce'
                      : 'text-teal-muted hover:text-teal'
                )}
              >
                {item.icon}
                {!item.highlight && (
                  <span className="text-[10px] font-medium">{item.label}</span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
