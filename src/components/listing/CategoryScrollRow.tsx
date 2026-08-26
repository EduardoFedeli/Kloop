"use client"

import Link from 'next/link'
import type { ReactNode } from 'react'
import { useDragScroll } from '@/lib/hooks/useDragScroll'
import { cn } from '@/lib/utils'

/**
 * `icon` chega já renderizado (JSX), não como referência de componente —
 * Server Components não podem passar funções como prop pra Client Components.
 */
export type CategoryCard = { icon: ReactNode; label: string; href: string }

export function CategoryScrollRow({ cards }: { cards: CategoryCard[] }) {
  const drag = useDragScroll<HTMLDivElement>()

  return (
    <div
      ref={drag.ref}
      onMouseDown={drag.onMouseDown}
      onMouseUp={drag.onMouseUp}
      onMouseLeave={drag.onMouseLeave}
      onMouseMove={drag.onMouseMove}
      onClickCapture={drag.onClickCapture}
      className={cn("flex gap-3 overflow-x-auto pb-3 px-5 [&::-webkit-scrollbar]:hidden", drag.className)}
      style={{ scrollbarWidth: 'none' }}
    >
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-[88px] h-[88px] bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:scale-[1.04] active:scale-[0.97] transition-transform"
        >
          {card.icon}
          <span className="text-[11px] font-bold text-[var(--foreground)] text-center leading-tight px-1">
            {card.label}
          </span>
        </Link>
      ))}
    </div>
  )
}
