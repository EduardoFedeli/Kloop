"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ArrowLeft, X, History, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Props {
  autoFocus?: boolean
  showBackButton?: boolean
  initialQuery?: string
  placeholder?: string
}

export function GlobalSearchBar({ 
  autoFocus = false, 
  showBackButton = false, 
  initialQuery = "",
  placeholder = 'busque "melissa"'
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock de buscas (no futuro você pode salvar no localStorage)
  const sugestoes = ["vestido farm", "tênis nike", "iphone 15", "bolsa schutz"]
  const recentes = ["jaqueta jeans", "sandália arezzo"]

  useEffect(() => {
    setQuery(initialQuery)
  }, [initialQuery])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setIsFocused(false)
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div className="relative w-full flex flex-col gap-3">
      {/* ── Seta para voltar isolada no topo ── */}
      {showBackButton && (
        <button 
          type="button" 
          onClick={() => router.back()}
          className="text-[var(--foreground)] p-1 -ml-1 self-start flex items-center hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={24} />
        </button>
      )}
      
      {/* ── Barra de busca ocupando largura total ── */}
      <form onSubmit={handleSearch} className="flex w-full items-center">
        <div className={cn(
          "relative flex-1 flex items-center bg-white dark:bg-[var(--color-pine)] border rounded-2xl transition-all shadow-sm",
          isFocused ? "border-[var(--color-teal)] ring-1 ring-[var(--color-teal)]/20" : "border-gray-200 dark:border-white/10"
        )}>
          <Search className="absolute left-4 text-gray-400" size={18} />
          <input 
            type="text"
            value={query}
            autoFocus={autoFocus}
            onFocus={() => setIsFocused(true)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent py-3.5 pl-11 pr-10 text-[15px] font-medium text-[var(--foreground)] outline-none placeholder:text-gray-400 dark:placeholder:text-sage/40"
          />
          {query && (
            <button 
              type="button" 
              onClick={() => setQuery("")}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown de Sugestões */}
      {isFocused && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/5" 
            onClick={() => setIsFocused(false)} 
          />
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-50 mt-2 bg-white dark:bg-[var(--color-pine)] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="p-4 space-y-6">
              {recentes.length > 0 && (
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-sage/50 mb-3">recentes</p>
                  <div className="space-y-3">
                    {recentes.map(item => (
                      <button 
                        key={item} 
                        onClick={() => { setQuery(item); router.push(`/search?q=${item}`); setIsFocused(false); }}
                        className="flex items-center gap-3 w-full text-left text-[14px] font-bold text-[var(--foreground)] hover:text-[var(--color-teal)] transition-colors"
                      >
                        <History size={16} className="text-gray-300" /> {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-sage/50 mb-3">bombando no kloop</p>
                <div className="space-y-3">
                  {sugestoes.map(item => (
                    <button 
                      key={item} 
                      onClick={() => { setQuery(item); router.push(`/search?q=${item}`); setIsFocused(false); }}
                      className="flex items-center gap-3 w-full text-left text-[14px] font-bold text-[var(--foreground)] hover:text-[var(--color-teal)] transition-colors"
                    >
                      <TrendingUp size={16} className="text-gray-300" /> {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}