'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
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

  const highlighted = listings
    .filter((l) => l.condition === 'LIKE_NEW' || l.condition === 'NEW')
    .slice(0, 4)

  return (
    <div className="space-y-10 pb-8 overflow-hidden">
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
              <Link
                href="/como-funciona"
                className="text-[13px] font-medium text-white underline underline-offset-4 hover:text-white/80 transition-colors"
              >
                saiba mais
              </Link>
            </div>
          </div>
          <div className="hidden md:flex w-64 h-64 items-center justify-center opacity-10 text-[180px] select-none pr-8">
            🏷️
          </div>
          <div className="absolute bottom-6 right-6 md:top-8 md:right-8 flex flex-col items-center bg-black/10 backdrop-blur-md rounded-2xl px-5 py-3">
            <span className="text-[18px] font-black text-white">até 30/04</span>
            <span className="text-[11px] text-white/80 font-medium">saldo cai em até 48h</span>
          </div>
        </div>
      </section>

      {/* ── Mini banners ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/search?condition=NEW"
          className="relative overflow-hidden rounded-2xl bg-[var(--color-pine)] dark:bg-[var(--color-teal)]/20 text-white p-6 flex flex-col justify-between min-h-[140px] hover:scale-[1.02] transition-transform group border border-transparent dark:border-[var(--color-teal)]/30"
        >
          <div className="space-y-1 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-celadon)]">em alta agora</p>
            <h3 className="text-[20px] font-black leading-tight">tênis &<br />calçados novos</h3>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-bold text-white group-hover:gap-2 transition-all relative z-10 mt-4">
            explorar <ArrowRight size={16} />
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-[80px] opacity-20 select-none transform rotate-[-15deg]">👟</div>
        </Link>

        <Link
          href="/search?dept=mocas&cat=bolsas"
          className="relative overflow-hidden rounded-2xl bg-[#0b2b20] dark:bg-[var(--color-forest)] text-white p-6 flex flex-col justify-between min-h-[140px] hover:scale-[1.02] transition-transform group border border-transparent dark:border-white/10"
        >
          <div className="space-y-1 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-sage)]">acessórios</p>
            <h3 className="text-[20px] font-black leading-tight">bolsas &<br />clutches</h3>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-bold text-white group-hover:gap-2 transition-all relative z-10 mt-4">
            ver tudo <ArrowRight size={16} />
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-[80px] opacity-20 select-none transform rotate-15">👜</div>
        </Link>

        <Link
          href="/search?dept=eletronicos"
          className="relative overflow-hidden rounded-2xl bg-[var(--color-forest)] dark:bg-black text-white p-6 flex flex-col justify-between min-h-[140px] hover:scale-[1.02] transition-transform group border border-transparent dark:border-white/5"
        >
          <div className="space-y-1 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-celadon)]">tech</p>
            <h3 className="text-[20px] font-black leading-tight">eletrônicos<br />seminovos</h3>
          </div>
          <div className="flex items-center gap-1 text-[13px] font-bold text-white group-hover:gap-2 transition-all relative z-10 mt-4">
            conferir <ArrowRight size={16} />
          </div>
          <div className="absolute right-0 bottom-[-10px] text-[80px] opacity-20 select-none">📱</div>
        </Link>
      </section>

      {/* ── Vendedores incríveis (Mobile adaptado) ── */}
      {sellers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-black text-[var(--foreground)]">vendedores incríveis</h2>
            <Link href="/search" className="text-[13px] font-bold text-[var(--color-teal)] hover:text-[var(--color-pine)] dark:hover:text-white flex items-center gap-1 transition-colors">
              ver todos <ArrowRight size={14} />
            </Link>
          </div>
          
          {/* Scroll horizontal no mobile */}
          <div className="-mx-4 px-4 overflow-x-auto pb-4 pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex gap-5 sm:grid sm:grid-cols-8 [&::-webkit-scrollbar]:hidden">
              {sellers.map((seller) => {
                const initials = seller.name?.substring(0, 2).toUpperCase() ?? 'KL'
                return (
                  <Link
                    key={seller.id}
                    href={`/profile/${seller.id}`}
                    className="flex flex-col items-center gap-2 group flex-shrink-0"
                  >
                    {seller.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={seller.avatarUrl}
                        alt={seller.name ?? 'Vendedor'}
                        className="w-16 h-16 rounded-full object-cover border-2 border-transparent group-hover:border-[var(--color-teal)] dark:group-hover:border-[var(--color-celadon)] transition-all shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-[var(--color-pine)] flex items-center justify-center text-[var(--color-teal)] dark:text-[var(--color-celadon)] font-black text-[16px] border-2 border-transparent group-hover:border-[var(--color-teal)] transition-all shadow-sm">
                        {initials}
                      </div>
                    )}
                    <p className="text-[12px] font-bold text-[var(--foreground)] truncate w-[70px] text-center transition-colors leading-tight">
                      {seller.name?.split(' ')[0].toLowerCase() ?? 'vendedor'}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Produtos em destaque (Minimalistas) ── */}
      {highlighted.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[18px] font-black text-[var(--foreground)]">produtos em destaque</h2>
            <Link href="/search?condition=LIKE_NEW" className="text-[13px] font-bold text-[var(--color-teal)] hover:text-[var(--color-pine)] dark:hover:text-white flex items-center gap-1 transition-colors">
              espiar <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-sage mb-5">seminovos e novos selecionados</p>
          
          {/* Adicionada a prop minimal={true} */}
          <ListingGrid listings={highlighted} favoriteIds={favoriteIds} minimal={true} />
        </section>
      )}

      {/* ── Feed principal (Minimalistas) ── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-[18px] font-black text-[var(--foreground)]">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name.toLowerCase() ?? 'produtos'
              : 'todos os produtos'}
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
          {/* Adicionada a prop minimal={true} */}
          <ListingGrid listings={filtered} favoriteIds={favoriteIds} minimal={true} />
        </div>
      </section>

      {/* ── CTA venda ── */}
      <section className="rounded-3xl bg-gray-50 dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 p-8 text-center space-y-4 shadow-sm mt-8">
        <h2 className="text-[20px] font-black text-[var(--foreground)]">seu armário cheio?</h2>
        <p className="text-[14px] text-gray-600 dark:text-sage max-w-sm mx-auto leading-relaxed">
          Venda o que você não usa mais e ganhe dinheiro sem sair de casa.
          Anunciar na Kloop é grátis.
        </p>
        <Link
          href="/create"
          className="inline-flex items-center gap-2 bg-[var(--color-pine)] dark:bg-[var(--color-celadon)] text-white dark:text-[var(--color-pine)] font-black px-8 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-pine)]/10"
        >
          <Tag size={18} />
          criar meu anúncio agora
        </Link>
      </section>
    </div>
  )
}