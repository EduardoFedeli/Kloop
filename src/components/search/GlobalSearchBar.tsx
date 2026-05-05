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
  placeholder = "o que você está procurando?"
}: Props) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 1. Estado para as buscas dinâmicas salvas no navegador
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Mock de buscas para preencher a tela se o usuário for novo
  const sugestoes = ["vestido farm", "tênis nike", "iphone 15", "bolsa schutz"]

  // 2. Carrega do localStorage ao montar o componente
  useEffect(() => {
    setQuery(initialQuery)
    const saved = localStorage.getItem('kloop_recent_searches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (e) {
        console.error("Erro ao ler buscas recentes", e)
      }
    }
  }, [initialQuery])

  // 3. Função que salva a busca no Histórico (LocalStorage)
  const saveSearchToHistory = (term: string) => {
    const termClean = term.trim().toLowerCase()
    if (!termClean) return

    setRecentSearches(prev => {
      // Remove se já existir para colocar no topo e limita a 5 itens
      const filtered = prev.filter(item => item !== termClean)
      const updated = [termClean, ...filtered].slice(0, 5)
      localStorage.setItem('kloop_recent_searches', JSON.stringify(updated))
      return updated
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    
    saveSearchToHistory(query)
    setIsFocused(false)
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  // Função disparada ao clicar em um item da lista
  const handleSuggestionClick = (term: string) => {
    setQuery(term)
    saveSearchToHistory(term)
    setIsFocused(false)
    router.push(`/search?q=${encodeURIComponent(term)}`)
  }

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation() // Evita que o clique feche o dropdown inteiro
    setRecentSearches([])
    localStorage.removeItem('kloop_recent_searches')
  }

  return (
    <div className="relative w-full flex items-center gap-2">
      {/* ── Seta para voltar alinhada ao lado da barra ── */}
      {showBackButton && (
        <button 
          type="button" 
          onClick={() => router.back()}
          className="text-[var(--foreground)] p-1 flex-shrink-0 flex items-center hover:opacity-70 transition-opacity"
        >
          <ArrowLeft size={24} />
        </button>
      )}
      
      {/* ── Barra de busca ── */}
      <form onSubmit={handleSearch} className="flex w-full items-center">
        <div className={cn(
          "relative flex-1 flex items-center bg-white dark:bg-[var(--color-pine)] border rounded-2xl transition-all shadow-sm z-50",
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

      {/* Dropdown de Sugestões Inteligentes */}
      {isFocused && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/5" 
            onClick={() => setIsFocused(false)} 
          />
          <div 
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-40 mt-2 bg-white dark:bg-[var(--color-pine)] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="p-4 space-y-6">
              
              {/* Histórico Real do Usuário */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 dark:text-sage/50">recentes</p>
                    <button onClick={clearHistory} className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase">
                      limpar
                    </button>
                  </div>
                  <div className="space-y-3">
                    {recentSearches.map(item => (
                      <button 
                        key={item} 
                        onClick={() => handleSuggestionClick(item)}
                        className="flex items-center gap-3 w-full text-left text-[14px] font-bold text-[var(--foreground)] hover:text-[var(--color-teal)] transition-colors"
                      >
                        <History size={16} className="text-gray-300" /> {item}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              
              
              
            </div>
          </div>
        </>
      )}
    </div>
  )
}