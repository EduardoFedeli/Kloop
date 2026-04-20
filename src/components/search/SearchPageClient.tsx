"use client"

import { useState } from "react"
import { SlidersHorizontal, ChevronDown, X } from "lucide-react"
import { ListingGrid } from "@/components/listing/ListingGrid"
import { GlobalSearchBar } from "./GlobalSearchBar"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  pills, 
  brands, 
  totalCount, 
  currentParams 
}: Props) {
  const router = useRouter()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const q = currentParams.q || ""

  // Função para aplicar ordenação rápida
  const handleSort = (sort: string) => {
    const params = new URLSearchParams(window.location.search)
    params.set("sort", sort)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* ── Topo: Barra Global + Subcategorias ── */}
      <div className="sticky top-0 z-20 bg-[var(--background)]/95 backdrop-blur-md px-4 pt-4 pb-2 space-y-4">
        <GlobalSearchBar showBackButton={true} initialQuery={q} />
        
        {pills.length > 0 && (
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {pills.map((p) => (
              <Link 
                key={p.name} 
                href={p.href}
                className="flex-shrink-0 px-4 py-2 bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 rounded-full text-[13px] font-bold text-[var(--foreground)] shadow-sm hover:border-[var(--color-teal)] transition-colors"
              >
                {p.name.toLowerCase()}
              </Link>
            ))}
          </div>
        )}

        {/* ── Info de resultados + Ordenação ── */}
        <div className="flex items-center justify-between pt-1">
          <p className="text-[13px] font-bold text-gray-500 dark:text-sage">
            {totalCount} {totalCount === 1 ? 'resultado' : 'resultados'}
          </p>
          <div className="flex items-center gap-1 text-[13px] font-black text-[var(--color-teal)] dark:text-[var(--color-celadon)] cursor-pointer">
            ordenar por: mais relevantes <ChevronDown size={14} />
          </div>
        </div>
      </div>

      {/* ── Grid de Produtos ── */}
      <div className="px-4 mt-4">
        <ListingGrid listings={listings} favoriteIds={favoriteIds} minimal={true} />
      </div>

      {/* ── FAB (Botão Flutuante de Filtros) ── */}
      <button 
        onClick={() => setIsFilterOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] pl-5 pr-6 py-4 rounded-full flex items-center gap-3 shadow-xl shadow-black/20 hover:scale-105 transition-transform"
      >
        <SlidersHorizontal size={18} strokeWidth={2.5} />
        <span className="text-[15px] font-black tracking-tight">filtros</span>
        {Object.keys(currentParams).filter(k => k !== 'q' && k !== 'sort').length > 0 && (
          <span className="w-5 h-5 bg-white dark:bg-[var(--color-pine)] text-[var(--color-pine)] dark:text-white rounded-full flex items-center justify-center text-[10px] font-black">
            {Object.keys(currentParams).filter(k => k !== 'q' && k !== 'sort').length}
          </span>
        )}
      </button>

      {/* ── Modal de Filtros (Drawer) ── */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[var(--color-pine)] w-full h-[90%] sm:max-w-lg sm:h-auto sm:rounded-3xl rounded-t-[32px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
            {/* Header Modal */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <button onClick={() => setIsFilterOpen(false)} className="text-[var(--foreground)]"><X size={24} /></button>
              <h2 className="text-[18px] font-black text-[var(--foreground)]">filtros</h2>
              <button 
                onClick={() => router.push('/search?q=' + q)}
                className="text-[13px] font-bold text-red-500"
              >
                limpar
              </button>
            </div>

            {/* Conteúdo Filtros */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Marcas */}
              <section>
                <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">marcas</p>
                <div className="flex flex-wrap gap-2">
                  {brands.map(brand => (
                    <button 
                      key={brand}
                      className={cn(
                        "px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all",
                        currentParams.brand === brand 
                          ? "bg-[var(--color-teal)] border-[var(--color-teal)] text-white" 
                          : "bg-gray-50 dark:bg-white/5 border-transparent text-[var(--foreground)]"
                      )}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </section>

              {/* Preço */}
              <section>
                <p className="text-[14px] font-black uppercase tracking-widest text-gray-400 mb-4">faixa de preço</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                    <p className="text-[11px] font-bold text-gray-400 mb-1">de</p>
                    <input type="number" placeholder="R$ 0" className="bg-transparent outline-none font-black w-full" />
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                    <p className="text-[11px] font-bold text-gray-400 mb-1">até</p>
                    <input type="number" placeholder="R$ 1000" className="bg-transparent outline-none font-black w-full" />
                  </div>
                </div>
              </section>
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-gray-100 dark:border-white/5">
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] py-4 rounded-full font-black text-[16px] shadow-lg"
              >
                ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}