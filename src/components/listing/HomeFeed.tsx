'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Tag, Zap, Megaphone } from 'lucide-react'
import type { ListingWithDetails, CategoryOption } from '@/types/listing'
import type { SellerPreview } from '@/app/(main)/page'
import { CategoryFilter } from './CategoryFilter'
import { ListingGrid } from './ListingGrid'

type Props = {
  listings: ListingWithDetails[]
  categories: CategoryOption[]
  favoriteIds?: string[]
  sellers?: SellerPreview[]
}

export function HomeFeed({ listings, categories, favoriteIds, sellers = [] }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filtered =
    selectedCategory === null
      ? listings
      : listings.filter((l) => l.category.slug === selectedCategory)

  // Mocks para simular Turbinados e Megafonados no MVP (pega os primeiros itens do feed)
  // No futuro, isso virá da Query: listings.filter(l => l.is_turbinado)
  const turbinados = listings.slice(0, 4) 
  const megafonados = listings.slice(4, 8)

  return (
    <div className="space-y-12 pb-8 overflow-hidden pt-4">
      
      {/* ── Hero banner (Mobile Edge-to-Edge) ── */}
      <section className="-mx-4 md:mx-0 relative overflow-hidden md:rounded-2xl bg-[var(--color-teal)] dark:bg-[var(--color-pine)] text-white">
        <div className="flex flex-col md:flex-row items-center">
          <div className="flex-1 p-8 md:p-12 space-y-4">
            <p className="text-[12px] font-bold uppercase tracking-widest text-white/80 dark:text-[var(--color-celadon)]/80">
              novidade
            </p>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              anuncie 5 produtos<br />
              <span className="text-[var(--color-pine)] dark:text-white">ganhe R$ 30 de crédito</span>
            </h1>
            <p className="text-[14px] text-white/90 max-w-sm">
              verifique se a promoção está disponível na sua central de vendas
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 bg-white text-[var(--color-pine)] font-bold px-6 py-3.5 rounded-full hover:bg-gray-100 transition-colors text-[14px] shadow-sm"
              >
                <Tag size={16} />
                botar pra vender
              </Link>
            </div>
          </div>
          <div className="hidden md:flex w-64 h-64 items-center justify-center opacity-10 text-[180px] select-none pr-8">
            🏷️
          </div>
        </div>
      </section>

      {/* ── Lojas dos Usuários (Estilo "Loja do Eduardo" com Blur) ── */}
      {sellers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-black text-[var(--foreground)]">lojinhas que amamos</h2>
            <Link href="/search" className="text-[13px] font-bold text-[var(--color-teal)] hover:text-[var(--color-pine)] flex items-center gap-1 transition-colors">
              ver todas <ArrowRight size={14} />
            </Link>
          </div>
          
          <div className="-mx-4 px-4 overflow-x-auto pb-4 pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex gap-4 sm:grid sm:grid-cols-4 [&::-webkit-scrollbar]:hidden">
              {sellers.map((seller) => {
                // Pegamos o primeiro nome
                const firstName = seller.name?.split(' ')[0] ?? 'vendedor'
                // Aqui simularíamos pegar a primeira foto de um produto ativo do vendedor. 
                // Como não temos no `sellers` array atual, usamos um fallback de cor.
                
                return (
                  <Link
                    key={seller.id}
                    href={`/profile/${seller.id}`}
                    className="relative w-[140px] h-[180px] sm:w-full sm:h-[220px] rounded-2xl overflow-hidden group flex-shrink-0 bg-gray-100 dark:bg-[var(--color-forest)] flex items-end"
                  >
                    {/* Imagem de Fundo (Simulando um produto da loja) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 transition-opacity group-hover:opacity-90" />
                    
                    {/* Usando o avatar como placeholder de fundo caso não tenha produto */}
                    {seller.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={seller.avatarUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-[2px] scale-110 group-hover:scale-105 group-hover:blur-0 transition-all duration-500" />
                    ) : (
                      <div className="absolute inset-0 bg-[var(--color-teal)]" />
                    )}

                    {/* Conteúdo da Lojinha */}
                    <div className="relative z-20 p-4 w-full text-center">
                      {seller.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={seller.avatarUrl} alt={firstName} className="w-10 h-10 rounded-full mx-auto mb-2 border-2 border-white shadow-md" />
                      ) : (
                         <div className="w-10 h-10 rounded-full bg-white mx-auto mb-2 flex items-center justify-center text-[var(--color-pine)] font-black shadow-md">
                           {firstName.charAt(0).toUpperCase()}
                         </div>
                      )}
                      <p className="text-[13px] font-black text-white leading-tight">
                        loja de<br/>{firstName.toLowerCase()}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Produtos Turbinados ── */}
      {turbinados.length > 0 && (
        <section className="bg-[var(--color-teal)]/5 dark:bg-[var(--color-celadon)]/5 -mx-4 px-4 py-8 rounded-3xl">
          <div className="flex items-center gap-2 mb-1">
             <div className="bg-[var(--color-teal)] text-white p-1 rounded-full">
                <Zap size={16} fill="currentColor" />
             </div>
            <h2 className="text-[18px] font-black text-[var(--foreground)]">sacolas turbinadas</h2>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-sage mb-5 ml-8">leve mais itens da mesma loja com desconto</p>
          
          <ListingGrid listings={turbinados} favoriteIds={favoriteIds} minimal={true} />
        </section>
      )}

      {/* ── Produtos Megafonados ── */}
      {megafonados.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-1">
             <div className="bg-[#FF9900] text-white p-1 rounded-full">
                <Megaphone size={16} fill="currentColor" />
             </div>
            <h2 className="text-[18px] font-black text-[var(--foreground)]">megafonados</h2>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-sage mb-5 ml-8">acabaram de gritar por aqui</p>
          
          <ListingGrid listings={megafonados} favoriteIds={favoriteIds} minimal={true} />
        </section>
      )}

      {/* ── Feed principal (Resto dos produtos) ── */}
      <section className="pt-4 border-t border-gray-100 dark:border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-[18px] font-black text-[var(--foreground)]">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name.toLowerCase() ?? 'produtos'
              : 'mais novidades'}
          </h2>
          <span className="text-[13px] text-gray-500 dark:text-sage font-medium">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>
        
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
        
        <div className="mt-5">
          <ListingGrid listings={filtered} favoriteIds={favoriteIds} minimal={true} />
        </div>
      </section>
    </div>
  )
}