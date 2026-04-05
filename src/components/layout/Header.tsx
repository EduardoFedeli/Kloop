import { Bell, MessageCircle } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-linen border-b border-teal-muted/30 px-4 py-3">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between">
        <span className="text-xl font-bold text-airforce tracking-tight">T-Hex Garage</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notificações"
            className="p-2 rounded-full hover:bg-celadon/30 transition-colors text-airforce"
          >
            <Bell size={22} />
          </button>
          <button
            type="button"
            aria-label="Mensagens"
            className="p-2 rounded-full hover:bg-celadon/30 transition-colors text-airforce"
          >
            <MessageCircle size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}
