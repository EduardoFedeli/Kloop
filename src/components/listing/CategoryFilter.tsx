'use client'

import { cn } from '@/lib/utils'
import type { CategoryOption } from '@/types/listing'

type Props = {
  categories: CategoryOption[]
  selected: string | null
  onChange: (slug: string | null) => void
}

export function CategoryFilter({ categories, selected, onChange }: Props) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => onChange(null)}
          className={cn(
            'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            selected === null
              ? 'bg-airforce text-linen'
              : 'bg-white border border-teal-muted/40 text-teal hover:bg-celadon/20'
          )}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.slug)}
            className={cn(
              'shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              selected === cat.slug
                ? 'bg-airforce text-linen'
                : 'bg-white border border-teal-muted/40 text-teal hover:bg-celadon/20'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-[var(--background)] to-transparent" />
    </div>
  )
}
