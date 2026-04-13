'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type CategoryOption = { id: string; name: string; slug: string }

type SearchParamsInput = {
  q?: string
  category?: string
  condition?: string
  priceMin?: string
  priceMax?: string
  sort?: string
}

type Props = {
  categories: CategoryOption[]
  searchParams: SearchParamsInput
}

type SortOption = { value: string; label: string }

const SORT_OPTIONS: SortOption[] = [
  { value: '', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Menor preço' },
  { value: 'price_desc', label: 'Maior preço' },
]

type ConditionOption = { value: string; label: string }

const CONDITION_OPTIONS: ConditionOption[] = [
  { value: '', label: 'Qualquer condição' },
  { value: 'NEW', label: 'Novo' },
  { value: 'LIKE_NEW', label: 'Seminovo' },
  { value: 'GOOD', label: 'Bom estado' },
  { value: 'FAIR', label: 'Usado' },
]

function countActiveFilters(params: SearchParamsInput): number {
  let count = 0
  if (params.category) count++
  if (params.condition) count++
  if (params.priceMin) count++
  if (params.priceMax) count++
  if (params.sort) count++
  return count
}

type FilterContentProps = {
  categories: CategoryOption[]
  searchParams: SearchParamsInput
  onApply: (newParams: Partial<SearchParamsInput>) => void
  onClear: () => void
}

function FilterContent({ categories, searchParams, onApply, onClear }: FilterContentProps) {
  const hasActiveFilters = countActiveFilters(searchParams) > 0

  const priceMinReais = searchParams.priceMin
    ? String(Math.round(Number(searchParams.priceMin) / 100))
    : ''
  const priceMaxReais = searchParams.priceMax
    ? String(Math.round(Number(searchParams.priceMax) / 100))
    : ''

  function handlePriceBlur(field: 'priceMin' | 'priceMax', value: string) {
    const reais = parseFloat(value)
    if (value === '' || isNaN(reais)) {
      onApply({ [field]: undefined })
    } else {
      onApply({ [field]: String(Math.round(reais * 100)) })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Ordenar por */}
      <div>
        <p className="text-xs font-semibold text-airforce uppercase tracking-wide mb-2">
          Ordenar por
        </p>
        <select
          value={searchParams.sort ?? ''}
          onChange={(e) => onApply({ sort: e.target.value || undefined })}
          className="w-full border border-teal-muted/30 rounded-xl px-3 py-2 text-sm text-airforce bg-white focus:outline-none focus:border-teal"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Categorias */}
      <div>
        <p className="text-xs font-semibold text-airforce uppercase tracking-wide mb-2">
          Categoria
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onApply({ category: undefined })}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              !searchParams.category
                ? 'bg-teal text-linen'
                : 'text-airforce hover:bg-celadon/30'
            )}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onApply({ category: cat.slug })}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                searchParams.category === cat.slug
                  ? 'bg-teal text-linen'
                  : 'text-airforce hover:bg-celadon/30'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Condição */}
      <div>
        <p className="text-xs font-semibold text-airforce uppercase tracking-wide mb-2">
          Condição
        </p>
        <div className="flex flex-wrap gap-2">
          {CONDITION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onApply({ condition: opt.value || undefined })}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                (searchParams.condition ?? '') === opt.value
                  ? 'bg-teal text-linen'
                  : 'text-airforce hover:bg-celadon/30'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Faixa de preço */}
      <div>
        <p className="text-xs font-semibold text-airforce uppercase tracking-wide mb-2">
          Faixa de preço
        </p>
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className="text-xs text-teal-muted mb-1 block">De: R$</label>
            <input
              type="number"
              min="0"
              step="1"
              defaultValue={priceMinReais}
              key={priceMinReais}
              onBlur={(e) => handlePriceBlur('priceMin', e.target.value)}
              className="w-full border border-teal-muted/30 rounded-xl px-3 py-2 text-sm text-airforce bg-white focus:outline-none focus:border-teal"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-teal-muted mb-1 block">Até: R$</label>
            <input
              type="number"
              min="0"
              step="1"
              defaultValue={priceMaxReais}
              key={priceMaxReais}
              onBlur={(e) => handlePriceBlur('priceMax', e.target.value)}
              className="w-full border border-teal-muted/30 rounded-xl px-3 py-2 text-sm text-airforce bg-white focus:outline-none focus:border-teal"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Limpar filtros */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="w-full py-2 rounded-xl border border-teal-muted/40 text-sm text-teal-muted hover:bg-celadon/20 transition-colors"
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}

export function SearchFilters({ categories, searchParams }: Props) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const activeCount = countActiveFilters(searchParams)

  function applyFilters(newParams: Partial<SearchParamsInput>) {
    const params = new URLSearchParams()

    // Preserve text search
    if (searchParams.q) params.set('q', searchParams.q)

    // Merge current filters with new ones (undefined = remove key)
    const merged: SearchParamsInput = { ...searchParams, ...newParams }

    if (merged.category) params.set('category', merged.category)
    if (merged.condition) params.set('condition', merged.condition)
    if (merged.priceMin) params.set('priceMin', merged.priceMin)
    if (merged.priceMax) params.set('priceMax', merged.priceMax)
    if (merged.sort) params.set('sort', merged.sort)

    router.push('/search?' + params.toString())
  }

  function clearFilters() {
    const q = searchParams.q
    router.push('/search' + (q ? '?q=' + encodeURIComponent(q) : ''))
    setDrawerOpen(false)
  }

  const filterContentProps: FilterContentProps = {
    categories,
    searchParams,
    onApply: (newParams) => {
      applyFilters(newParams)
      setDrawerOpen(false)
    },
    onClear: clearFilters,
  }

  return (
    <>
      {/* Mobile: Filtrar button */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-teal-muted/40 text-sm font-medium text-airforce bg-white hover:bg-celadon/20 transition-colors"
        >
          <SlidersHorizontal size={16} />
          {activeCount > 0 ? `Filtrar (${activeCount})` : 'Filtrar'}
        </button>

        {/* Drawer overlay */}
        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-airforce">Filtros</h2>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-celadon/30 transition-colors text-teal-muted"
                  aria-label="Fechar filtros"
                >
                  <X size={20} />
                </button>
              </div>
              <FilterContent {...filterContentProps} />
            </div>
          </>
        )}
      </div>

      {/* Desktop: Static sidebar */}
      <aside className="hidden lg:block w-64 shrink-0">
        <div className="bg-white rounded-2xl border border-teal-muted/20 p-5">
          <h2 className="text-sm font-semibold text-airforce uppercase tracking-wide mb-4 flex items-center gap-2">
            <SlidersHorizontal size={15} />
            Filtros
          </h2>
          <FilterContent {...filterContentProps} />
        </div>
      </aside>
    </>
  )
}
