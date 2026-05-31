"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback } from "react"
import { SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

type SortOption = 'newest' | 'price_asc' | 'price_desc'
type ConditionFilter = 'ALL' | 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR'

interface Props {
  currentSort: SortOption
  currentCondition: ConditionFilter
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
]

const CONDITION_OPTIONS: { value: ConditionFilter; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'NEW', label: 'Novo' },
  { value: 'LIKE_NEW', label: 'Seminovo' },
  { value: 'GOOD', label: 'Bom' },
  { value: 'FAIR', label: 'Regular' },
]

export function KloopShopFilters({ currentSort, currentCondition }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'newest' || value === 'ALL') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide flex-shrink-0">
          <ArrowUpDown size={12} />
          ordenar
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('sort', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all",
                currentSort === opt.value
                  ? "bg-[var(--color-pine)] text-white border-[var(--color-pine)] dark:bg-[var(--color-teal)] dark:border-[var(--color-teal)]"
                  : "bg-white dark:bg-[var(--color-pine)] text-gray-500 dark:text-sage border-gray-200 dark:border-white/10 hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide flex-shrink-0">
          <SlidersHorizontal size={12} />
          filtrar
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CONDITION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateParam('condition', opt.value)}
              className={cn(
                "px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all",
                currentCondition === opt.value
                  ? "bg-[var(--color-pine)] text-white border-[var(--color-pine)] dark:bg-[var(--color-teal)] dark:border-[var(--color-teal)]"
                  : "bg-white dark:bg-[var(--color-pine)] text-gray-500 dark:text-sage border-gray-200 dark:border-white/10 hover:border-[var(--color-teal)] hover:text-[var(--color-teal)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
