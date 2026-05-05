"use client"

import { useState, useEffect } from "react"
// Adicionamos o ChevronRight para a árvore de navegação
import { SlidersHorizontal, ChevronDown, ChevronRight, X } from "lucide-react"
import { ListingGrid } from "@/components/listing/ListingGrid"
import { GlobalSearchBar } from "./GlobalSearchBar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { ListingWithDetails } from "@/types/listing"

interface Props {
  listings: ListingWithDetails[]
  favoriteIds: string[]
  breadcrumbs: { label: string; href: string }[]
  pills: { name: string; href: string }[]
  brands: string[]
  availableConditions: string[]
  totalCount: number
  currentParams: Record<string, string | undefined>
}

export function SearchPageClient({ 
  listings, 
  favoriteIds, 
  breadcrumbs,
  pills, 
  brands, 
  availableConditions,
  totalCount, 
  currentParams 
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const q = currentParams.q || ""

  const [localBrand, setLocalBrand] = useState(currentParams.brand || "")
  const [localMinPrice, setLocalMinPrice] = useState(currentParams.minPrice || "")
  const [localMaxPrice, setLocalMaxPrice] = useState(currentParams.maxPrice || "")
  const [localCondition, setLocalCondition] = useState(currentParams.condition || "")
  const [localNewness, setLocalNewness] = useState(currentParams.newness || "")

  useEffect(() => {
    setLocalBrand(currentParams.brand || "")
    setLocalMinPrice(currentParams.minPrice || "")
    setLocalMaxPrice(currentParams.maxPrice || "")
    setLocalCondition(currentParams.condition || "")
    setLocalNewness(currentParams.newness || "")
  }, [currentParams])

  const toggleBrand = (b: string) => setLocalBrand(prev => prev === b ? "" : b)
  const toggleCondition = (c: string) => setLocalCondition(prev => prev === c ? "" : c)
  const toggleNewness = (n: string) => setLocalNewness(prev => prev === n ? "" : n)

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (localBrand) params.set('brand', localBrand)
    else params.delete('brand')
    
    if (localMinPrice) params.set('minPrice', localMinPrice)
    else params.delete('minPrice')
    
    if (localMaxPrice) params.set('maxPrice', localMaxPrice)
    else params.delete('maxPrice')

    if (localCondition) params.set('condition', localCondition)
    else params.delete('condition')

    if (localNewness) params.set('newness', localNewness)
    else params.delete('newness')

    setIsFilterOpen(false)
    router.push(`/search?${params.toString()}`)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('brand')
    params.delete('minPrice')
    params.delete('maxPrice')
    params.delete('condition')
    params.delete('newness')
    
    setLocalBrand("")
    setLocalMinPrice("")
    setLocalMaxPrice("")
    setLocalCondition("")
    setLocalNewness("")
    
    setIsFilterOpen(false)
    router.push(`/search?${params.toString()}`)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSort = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSort) {
      params.set('sort', newSort);
    } else {
      params.delete('sort');
    }
    
    router.push(`/search?${params.toString()}`);
  }

  const conditionLabelMap: Record<string, string> = {
    NEW: 'novo', LIKE_NEW: 'seminovo', GOOD: 'bom estado', FAIR: 'usado'
  }

  const activeFilterTags = []
  if (currentParams.brand) {
    const p = new URLSearchParams(searchParams.toString()); p.delete('brand')
    activeFilterTags.push({ label: `Marca: ${currentParams.brand}`, removeUrl: `/search?${p.toString()}` })
  }
  if (currentParams.minPrice) {
    const p = new URLSearchParams(searchParams.toString()); p.delete('minPrice')
    activeFilterTags.push({ label: `A partir de R$ ${currentParams.minPrice}`, removeUrl: `/search?${p.toString()}` })
  }
  if (currentParams.maxPrice) {
    const p = new URLSearchParams(searchParams.toString()); p.delete('maxPrice')
    activeFilterTags.push({ label: `Até R$ ${currentParams.maxPrice}`, removeUrl: `/search?${p.toString()}` })
  }
  if (currentParams.condition) {
    const p = new URLSearchParams(searchParams.toString()); p.delete('condition')
    activeFilterTags.push({ label: conditionLabelMap[currentParams.condition] || 'condição', removeUrl: `/search?${p.toString()}` })
  }
  if (currentParams.newness) {
    const p = new URLSearchParams(searchParams.toString()); p.delete('newness')
    const labels: Record<string, string> = { '1': '24h', '7': '7 dias', '14': '14 dias', '30': '30 dias' }
    activeFilterTags.push({ label: `Últimos ${labels[currentParams.newness]}`, removeUrl: `/search?${p.toString()}` })
  }

  const activeFiltersCount = activeFilterTags.length

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* ── Topo Fixo ── */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/95 backdrop-blur-md px-4 pt-2 pb-2 space-y-4">
        
        {/* Barra Global atualizada */}
        <GlobalSearchBar showBackButton={true} initialQuery={q} />
        
        {/* ── Árvore de Categorias (Breadcrumbs + Cards de Drill-down) ── */}
        {(breadcrumbs.length > 0 || pills.length > 0) && (
          <div className="space-y-3">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden pb-1">
                <Link href="/search" className="hover:text-[var(--color-teal)] transition-colors">início</Link>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center gap-1.5">
                    <ChevronRight size={14} className="text-gray-300 dark:text-sage/40" />
                    <Link 
                      href={crumb.href} 
                      className={cn(
                        "hover:text-[var(--color-teal)] transition-colors", 
                        index === breadcrumbs.length - 1 ? "font-bold text-[var(--foreground)]" : ""
                      )}
                    >
                      {crumb.label.toLowerCase()}
                    </Link>
                  </div>
                ))}
              </div>
            )}
            
            {/* Caixinhas de Subcategorias (pills) */}
            {pills.length > 0 && (
              <div className="flex gap-4 overflow-x-auto -mx-4 px-4 pb-2 pt-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                {pills.map((p) => (
                  <Link 
                    key={p.name} 
                    href={p.href}
                    className="flex flex-col items-center gap-2 group flex-shrink-0 w-[64px]"
                  >
                    <div className="w-[64px] h-[64px] bg-white dark:bg-[var(--color-pine)] rounded-[20px] shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-300 dark:text-white/20 group-hover:border-[var(--color-teal)] group-hover:text-[var(--color-teal)] transition-all">
                      <span className="text-[24px] font-black uppercase opacity-50 group-hover:opacity-100">{p.name.charAt(0)}</span>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--foreground)] text-center leading-tight truncate w-full">
                      {p.name.toLowerCase()}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filtros Ativos */}
        {activeFilterTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {activeFilterTags.map((af) => (
              <Link 
                key={af.label} 
                href={af.removeUrl}
                className="flex-shrink-0 px-3 py-1.5 bg-[var(--color-teal)]/10 text-[var(--color-teal)] dark:bg-[var(--color-celadon)]/10 dark:text-[var(--color-celadon)] border border-[var(--color-teal)]/20 rounded-full text-[12px] font-bold flex items-center gap-1.5 hover:brightness-95 transition-all"
              >
                {af.label}
                <X size={12} strokeWidth={3} />
              </Link>
            ))}
          </div>
        )}

        {/* Info + Ordenação */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-[13px] font-bold text-gray-500 dark:text-sage">
            {totalCount} {totalCount === 1 ? 'resultado' : 'resultados'}
          </p>
          
          <div className="relative flex items-center gap-1">
            <span className="text-[13px] font-bold text-gray-500 dark:text-sage">ordenar por:</span>
            <div className="relative flex items-center">
              <select
                value={currentParams.sort || 'popular'}
                onChange={handleSortChange}
                className="appearance-none bg-transparent text-[13px] font-black text-[var(--color-teal)] dark:text-[var(--color-celadon)] pr-5 cursor-pointer outline-none"
              >
                <option value="popular">mais relevantes</option>
                <option value="recent">mais recentes</option>
                <option value="price_asc">menor preço</option>
                <option value="price_desc">maior preço</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 text-[var(--color-teal)] dark:text-[var(--color-celadon)] pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Container de Resultados ou Estado Vazio */}
      <div className="px-4 mt-4 min-h-[50vh] flex flex-col">
        {totalCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center pt-24 pb-12">
            <p className="text-[16px] font-medium text-[var(--color-teal)] dark:text-[var(--color-celadon)]">
              Nenhum anúncio encontrado.
            </p>
          </div>
        ) : (
          <ListingGrid listings={listings} favoriteIds={favoriteIds} variant="search" />
        )}
      </div>

      <button 
        onClick={() => setIsFilterOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] pl-5 pr-6 py-4 rounded-full flex items-center gap-3 shadow-xl shadow-black/20 hover:scale-105 transition-transform"
      >
        <SlidersHorizontal size={18} strokeWidth={2.5} />
        <span className="text-[15px] font-black tracking-tight">filtros</span>
        {activeFiltersCount > 0 && (
          <span className="w-5 h-5 bg-white dark:bg-[var(--color-pine)] text-[var(--color-pine)] dark:text-white rounded-full flex items-center justify-center text-[10px] font-black">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Modal de Filtros mantido idêntico */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[var(--color-pine)] w-full h-[90%] sm:max-w-lg sm:h-auto sm:rounded-3xl rounded-t-[32px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <button onClick={() => setIsFilterOpen(false)} className="text-[var(--foreground)]"><X size={24} /></button>
              <h2 className="text-[18px] font-black text-[var(--foreground)]">filtros</h2>
              <button onClick={clearAllFilters} className="text-[13px] font-bold text-red-500">limpar</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Seção Condição */}
              {availableConditions.length > 0 && (
                <section>
                  <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">condição</p>
                  <div className="flex flex-wrap gap-2">
                    {availableConditions.map(cond => (
                      <button 
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all",
                          localCondition === cond 
                            ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" 
                            : "bg-gray-50 dark:bg-white/5 border-transparent text-[var(--foreground)]"
                        )}
                      >
                        {conditionLabelMap[cond] || cond}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Seção Marcas */}
              {brands.length > 0 && (
                <section>
                  <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">marcas</p>
                  <div className="flex flex-wrap gap-2">
                    {brands.map(brand => (
                      <button 
                        key={brand}
                        onClick={() => toggleBrand(brand)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all",
                          localBrand === brand 
                            ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" 
                            : "bg-gray-50 dark:bg-white/5 border-transparent text-[var(--foreground)]"
                        )}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Seção Novidades */}
              <section>
                <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">novidade</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { val: '1', label: 'últimas 24h' },
                    { val: '7', label: 'últimos 7 dias' },
                    { val: '14', label: 'últimos 14 dias' },
                    { val: '30', label: 'últimos 30 dias' }
                  ].map(opt => (
                    <button 
                      key={opt.val}
                      onClick={() => toggleNewness(opt.val)}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all",
                        localNewness === opt.val 
                          ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" 
                          : "bg-gray-50 dark:bg-white/5 border-transparent text-[var(--foreground)]"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* Seção Faixa de Preço */}
              <section>
                <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">faixa de preço</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-transparent focus-within:border-[var(--color-teal)] transition-colors">
                    <p className="text-[11px] font-bold text-gray-400 mb-1">de</p>
                    <input type="number" value={localMinPrice} onChange={(e) => setLocalMinPrice(e.target.value)} placeholder="R$ 0" className="bg-transparent outline-none font-black w-full text-[var(--foreground)]" />
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-transparent focus-within:border-[var(--color-teal)] transition-colors">
                    <p className="text-[11px] font-bold text-gray-400 mb-1">até</p>
                    <input type="number" value={localMaxPrice} onChange={(e) => setLocalMaxPrice(e.target.value)} placeholder="R$ 1000" className="bg-transparent outline-none font-black w-full text-[var(--foreground)]" />
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-white/5">
              <button onClick={applyFilters} className="w-full bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] py-4 rounded-full font-black text-[16px] shadow-lg hover:opacity-90 transition-opacity">
                ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}