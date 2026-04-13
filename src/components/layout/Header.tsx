import Link from "next/link"
import { Search, Bell, MessageCircle } from "lucide-react"
import { auth } from "@/lib/auth"
import { HeaderAuth } from "@/components/layout/HeaderAuth"

const navLinks = [
  { href: "/search?category=roupas", label: "roupas" },
  { href: "/search?category=calcados", label: "calçados" },
  { href: "/search?category=acessorios", label: "acessórios" },
  { href: "/search?category=eletronicos", label: "eletrônicos" },
  { href: "/search?category=casa", label: "casa" },
  { href: "/search?category=outros", label: "outros" },
]

type Props = {
  unreadCount?: number
}

export async function Header({ unreadCount }: Props) {
  const session = await auth()

  return (
    <header className="sticky top-0 z-40 bg-linen border-b border-teal-muted/30">
      {/* Promo bar — desktop only */}
      <div className="hidden md:flex items-center justify-center gap-6 bg-airforce text-linen text-xs px-4 py-1.5">
        <span>📱 baixe o app T-Hex Garage</span>
        <span className="opacity-40">|</span>
        <Link
          href="/como-vender"
          className="underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          veja como anunciar é mágico
        </Link>
      </div>

      {/* Main row */}
      <div className="px-4 py-3">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-1">
            <span className="text-xl font-black text-airforce tracking-tight">T-Hex</span>
            <span className="text-xl font-black text-teal tracking-tight">Garage</span>
          </Link>

          {/* Search — desktop */}
          <form action="/search" method="get" className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="flex w-full rounded-full border-2 border-teal-muted/40 bg-white overflow-hidden focus-within:border-teal transition-colors">
              <input
                name="q"
                type="text"
                placeholder='busque "tênis", "iPhone", "jaqueta"...'
                className="flex-1 px-5 py-2.5 text-sm bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="px-5 bg-teal text-linen hover:bg-airforce transition-colors flex items-center"
                aria-label="Buscar"
              >
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="ml-auto md:ml-0 flex items-center gap-1">
            {/* Mobile search */}
            <Link
              href="/search"
              aria-label="Buscar"
              className="md:hidden p-2 rounded-full hover:bg-celadon/30 transition-colors text-airforce"
            >
              <Search size={22} />
            </Link>

            <button
              type="button"
              aria-label="Notificações"
              className="p-2 rounded-full hover:bg-celadon/30 transition-colors text-airforce"
            >
              <Bell size={22} />
            </button>

            {/* Chat icon com badge */}
            <Link
              href="/chat"
              aria-label="Mensagens"
              className="relative p-2 rounded-full hover:bg-celadon/30 transition-colors text-airforce"
            >
              <MessageCircle size={22} />
              {unreadCount && unreadCount > 0 ? (
                <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>

            {/* Injeção do Auth */}
            <div className="ml-2 flex items-center">
              <HeaderAuth user={session?.user} />
            </div>
          </div>
        </div>
      </div>

      {/* Category nav — desktop only */}
      <nav className="hidden md:block border-t border-teal-muted/20">
        <div className="max-w-screen-xl mx-auto px-4">
          <ul className="flex items-center gap-0.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-block px-4 py-2.5 text-sm font-medium text-airforce hover:text-teal hover:bg-celadon/30 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  )
}
