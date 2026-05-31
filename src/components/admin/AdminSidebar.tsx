"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAdmin } from "@/lib/actions/admin"
import { ShieldCheck, Package, ShieldAlert, LogOut, Tags, Users, TrendingUp, Calculator, Store } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin/vendas", label: "Vendas", icon: TrendingUp },
  { href: "/admin/simulador", label: "Simulador", icon: Calculator },
  { href: "/admin/lotes", label: "Lotes", icon: Package },
  { href: "/admin/kloop-shop", label: "Kloop Shop", icon: Store },
  { href: "/admin/denuncias", label: "Denúncias", icon: ShieldAlert },
  { href: "/admin/marcas", label: "Marcas", icon: Tags },
  { href: "/admin/usuarios", label: "Usuários", icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-[var(--color-pine)] flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <ShieldCheck size={16} className="text-white" />
          </div>
          <div>
            <p className="text-[14px] font-black text-white leading-none">kloop</p>
            <p className="text-[10px] text-white/40 leading-none mt-0.5">admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/50 hover:bg-white/10 hover:text-white/80"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-white/50 hover:bg-white/10 hover:text-white/80 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
