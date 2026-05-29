"use client"

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ListingCard } from '@/components/listing/ListingCard'
import type { ListingWithDetails } from '@/types/listing'

type Props = {
  favorites: ListingWithDetails[]
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
        on ? "bg-[var(--color-teal)]" : "bg-gray-300 dark:bg-white/20"
      )}
    >
      <span className={cn(
        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
        on ? "translate-x-6" : "translate-x-0"
      )} />
    </button>
  )
}

export function FavoritosClient({ favorites }: Props) {
  const [onlyAvailable, setOnlyAvailable] = useState(true)

  const displayed = onlyAvailable
    ? favorites.filter((l) => l.status === 'ACTIVE')
    : favorites

  return (
    <div>
      <div className="flex items-center justify-between mb-4 px-0.5">
        <span className="text-[14px] font-bold text-[var(--foreground)]">somente disponíveis</span>
        <Toggle on={onlyAvailable} onToggle={() => setOnlyAvailable((v) => !v)} />
      </div>

      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">
          <span className="text-7xl select-none">🤍</span>
          <div className="space-y-2">
            <h3 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">
              {favorites.length === 0 ? 'sem favoritos ainda' : 'nenhum disponível no momento'}
            </h3>
            <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed max-w-[280px]">
              {favorites.length === 0
                ? 'deu o coração em alguma peça? ela aparece aqui.'
                : 'desative o filtro para ver todos os seus favoritos.'}
            </p>
          </div>
          {favorites.length === 0 && (
            <Link
              href="/search"
              className="border-2 border-[var(--color-pine)] dark:border-[var(--color-teal)] text-[var(--color-pine)] dark:text-[var(--color-teal)] px-8 py-3 rounded-full font-bold text-[14px] hover:bg-[var(--color-pine)]/5 dark:hover:bg-[var(--color-teal)]/5 transition-colors"
            >
              explorar produtos
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {displayed.map((listing) => (
            <ListingCard key={listing.id} listing={listing} variant="search" />
          ))}
        </div>
      )}
    </div>
  )
}
