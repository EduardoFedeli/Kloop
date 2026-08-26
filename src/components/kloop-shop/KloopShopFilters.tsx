"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useState } from "react"
import { SlidersHorizontal, ArrowUpDown } from "lucide-react"

type SortOption = 'newest' | 'price_asc' | 'price_desc'
type ConditionFilter = 'ALL' | 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR'

interface Props {
  currentSort: SortOption
  currentCondition: ConditionFilter
  currentMinPrice?: string
  currentMaxPrice?: string
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
]

const CONDITION_OPTIONS: { value: ConditionFilter; label: string }[] = [
  { value: 'ALL', label: 'Todas as condições' },
  { value: 'NEW', label: 'Novo' },
  { value: 'LIKE_NEW', label: 'Seminovo' },
  { value: 'GOOD', label: 'Bom' },
  { value: 'FAIR', label: 'Regular' },
]

const selectClass =
  "w-full appearance-none px-3 py-2 rounded-xl text-[13px] font-bold border bg-white dark:bg-[var(--color-pine)] text-[var(--foreground)] border-gray-200 dark:border-white/10 focus:outline-none focus:border-[var(--color-teal)]"

export function KloopShopFilters({ currentSort, currentCondition, currentMinPrice, currentMaxPrice }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [minPrice, setMinPrice] = useState(currentMinPrice ?? "")
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice ?? "")

  const updateParams = useCallback((updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      const isDefault = (key === 'sort' && value === 'newest') || (key === 'condition' && value === 'ALL') || value === ''
      if (isDefault) params.delete(key)
      else params.set(key, value)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [router, pathname, searchParams])

  return (
    <div className="grid grid-cols-2 gap-2">
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
          <ArrowUpDown size={12} />
          ordenar
        </div>
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className={selectClass}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
          <SlidersHorizontal size={12} />
          condição
        </div>
        <select
          value={currentCondition}
          onChange={(e) => updateParams({ condition: e.target.value })}
          className={selectClass}
        >
          {CONDITION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="col-span-2">
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-1.5">
          faixa de preço
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="mín. R$"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={() => updateParams({ minPrice })}
            className={selectClass}
          />
          <span className="text-gray-300 dark:text-white/20 text-[12px]">até</span>
          <input
            type="number"
            min={0}
            inputMode="decimal"
            placeholder="máx. R$"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={() => updateParams({ maxPrice })}
            className={selectClass}
          />
        </div>
      </div>
    </div>
  )
}
