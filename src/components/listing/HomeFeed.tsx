'use client'

import Link from 'next/link'
import { ArrowRight, Tag, Zap, Megaphone, Building2 } from 'lucide-react'
import type { ListingWithDetails } from '@/types/listing'
import type { SellerPreview, CommunitySection, BentoCard } from '@/app/(main)/page'
import { ListingCard } from './ListingCard'
import { ListingGrid } from './ListingGrid'

type Props = {
  listings: ListingWithDetails[]
  favoriteIds?: string[]
  sellers?: SellerPreview[]
  communitySection?: CommunitySection | null
  bentoCards?: BentoCard[]
}

export function HomeFeed({ listings, favoriteIds, sellers = [], communitySection, bentoCards = [] }: Props) {
  const turbinados = listings.filter((l) => l.isTurbinado === true).slice(0, 4)
  const megafonados = listings.filter((l) => !l.isTurbinado).slice(0, 4)

  return (
    <div className="space-y-12 pb-8 overflow-hidden pt-4">

      {/* ── Hero banner ── */}
      <section
        className="-mx-4 md:mx-0 relative overflow-hidden md:rounded-2xl text-white"
        style={{ background: 'linear-gradient(135deg, var(--color-pine) 0%, var(--color-emerald) 60%, var(--color-teal) 100%)' }}
      >
        {/* Atmospheric layers */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute right-8 bottom-0 w-48 h-48 rounded-full bg-[var(--color-celadon)]/10 blur-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center">
          <div className="flex-1 p-8 md:p-12 space-y-4">
            <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.1em] text-white/90 border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-celadon)]" />
              novidade
            </span>
            <h1 className="text-[28px] md:text-[38px] font-semibold leading-[1.1] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              anuncie 5 produtos<br />
              <span className="text-[var(--color-celadon)]">ganhe R$ 30 de crédito</span>
            </h1>
            <p className="text-[13px] text-white/70 max-w-xs leading-relaxed">
              verifique se a promoção está disponível na sua central de vendas
            </p>
            <div className="pt-2">
              <Link
                href="/create"
                className="inline-flex items-center gap-2 bg-white text-[var(--color-pine)] font-black px-6 py-3 rounded-full hover:bg-[var(--color-frosted)] active:scale-95 transition-all text-[13px] shadow-lg shadow-black/20"
              >
                <Tag size={15} />
                botar pra vender
              </Link>
            </div>
          </div>

          {/* Right visual — abstract rings */}
          <div className="hidden md:flex w-56 h-56 items-center justify-center mr-8 relative flex-shrink-0">
            <div className="absolute w-44 h-44 rounded-full border border-white/10" />
            <div className="absolute w-32 h-32 rounded-full border border-white/15" />
            <div className="absolute w-20 h-20 rounded-full bg-white/5 border border-white/20" />
            <Tag size={28} className="text-white/40" strokeWidth={1.5} />
          </div>
        </div>
      </section>

      {/* ── Lojinhas ── */}
      {sellers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[19px] font-semibold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>lojinhas que amamos</h2>
            <Link href="/search" className="text-[12px] font-bold text-[var(--color-teal)] dark:text-[var(--color-celadon)] hover:opacity-70 flex items-center gap-1 transition-opacity">
              ver todas <ArrowRight size={13} />
            </Link>
          </div>

          <div className="-mx-4 px-4 overflow-x-auto pb-3 pt-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex gap-3 sm:grid sm:grid-cols-4 [&::-webkit-scrollbar]:hidden">
              {sellers.map((seller) => {
                const firstName = seller.name?.split(' ')[0] ?? 'vendedor'
                const initial = firstName.charAt(0).toUpperCase()

                return (
                  <Link
                    key={seller.id}
                    href={`/profile/${seller.id}`}
                    className="relative w-[130px] h-[170px] sm:w-full sm:h-[200px] rounded-2xl overflow-hidden group flex-shrink-0 flex items-end"
                  >
                    {/* Background */}
                    {seller.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={seller.avatarUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover scale-110 group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(135deg, var(--color-emerald), var(--color-teal))' }}
                      />
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                    {/* Label */}
                    <div className="relative z-10 px-3 pb-3 w-full">
                      <p className="text-[10px] text-white/60 leading-none mb-0.5">loja de</p>
                      <p className="text-[14px] font-black text-white leading-tight truncate">
                        {firstName.toLowerCase()}
                      </p>
                    </div>

                    {/* Initial badge */}
                    <div className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                      <span className="text-[11px] font-black text-white">{initial}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Turbinados ── */}
      {turbinados.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-6 h-6 rounded-full bg-[var(--color-teal)] flex items-center justify-center flex-shrink-0">
              <Zap size={13} fill="currentColor" className="text-white" />
            </div>
            <h2 className="text-[19px] font-semibold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>sacolas turbinadas</h2>
          </div>
          <p className="text-[12px] text-gray-400 dark:text-[var(--color-sage)] mb-5 pl-[34px]">
            leve mais itens da mesma loja com desconto
          </p>
          <div className="bg-[var(--color-teal)]/4 dark:bg-[var(--color-celadon)]/4 -mx-4 px-4 py-6 rounded-3xl border border-[var(--color-teal)]/8 dark:border-[var(--color-celadon)]/8">
            {/* Mobile: horizontal shelf */}
            <div className="sm:hidden -mx-4 px-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-3">
                {turbinados.map((listing) => (
                  <div key={listing.id} className="w-[155px] flex-shrink-0">
                    <ListingCard
                      listing={listing}
                      isFavorited={(favoriteIds ?? []).includes(listing.id)}
                      minimal={true}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop: grid */}
            <div className="hidden sm:block">
              <ListingGrid listings={turbinados} favoriteIds={favoriteIds} minimal={true} />
            </div>
          </div>
        </section>
      )}

      {/* ── Megafonados ── */}
      {megafonados.length > 0 && (
        <section>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
              <Megaphone size={13} fill="currentColor" className="text-white" />
            </div>
            <h2 className="text-[19px] font-semibold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>megafonados</h2>
          </div>
          <p className="text-[12px] text-gray-400 dark:text-[var(--color-sage)] mb-5 pl-[34px]">
            acabaram de gritar por aqui
          </p>
          {/* Mobile: horizontal shelf */}
          <div className="sm:hidden -mx-4 px-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3">
              {megafonados.map((listing) => (
                <div key={listing.id} className="w-[155px] flex-shrink-0">
                  <ListingCard
                    listing={listing}
                    isFavorited={(favoriteIds ?? []).includes(listing.id)}
                    minimal={true}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* Desktop: grid */}
          <div className="hidden sm:block">
            <ListingGrid listings={megafonados} favoriteIds={favoriteIds} minimal={true} />
          </div>
        </section>
      )}

      {/* ── Comunidade ── */}
      {communitySection && communitySection.listings.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[var(--color-emerald)] flex items-center justify-center flex-shrink-0">
                <Building2 size={13} className="text-white" />
              </div>
              <h2 className="text-[19px] font-semibold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
                {communitySection.communityName.toLowerCase()}
              </h2>
            </div>
            <Link
              href={`/comunidades/${communitySection.communitySlug}`}
              className="text-[12px] font-bold text-[var(--color-teal)] dark:text-[var(--color-celadon)] hover:opacity-70 flex items-center gap-1 transition-opacity"
            >
              ver tudo <ArrowRight size={13} />
            </Link>
          </div>
          <div className="-mx-4 px-4 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex gap-3">
              {communitySection.listings.map((listing) => (
                <div key={listing.id} className="w-[155px] flex-shrink-0">
                  <ListingCard
                    listing={listing}
                    isFavorited={(favoriteIds ?? []).includes(listing.id)}
                    minimal={true}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Preferência de gênero — bento de categorias ── */}
      {bentoCards.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-[19px] font-semibold text-[var(--foreground)]" style={{ fontFamily: 'var(--font-display)' }}>
              escolhido para você
            </h2>
            <p className="text-[12px] text-gray-400 dark:text-[var(--color-sage)] mt-0.5">
              baseado nas suas preferências
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {/* Big card — first item */}
            <Link
              href={bentoCards[0].href}
              className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden h-[220px] group"
              style={{ background: 'linear-gradient(135deg, var(--color-pine), var(--color-emerald))' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-white text-[18px] font-black leading-tight capitalize">
                  {bentoCards[0].label.toLowerCase()}
                </p>
                <p className="text-white/60 text-[11px] mt-0.5">ver produtos</p>
              </div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight size={16} className="text-white" />
              </div>
            </Link>

            {/* Small cards — remaining */}
            {bentoCards.slice(1, 5).map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="relative rounded-2xl overflow-hidden h-[102px] group bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 flex items-end p-3 hover:border-[var(--color-teal)]/40 transition-colors"
              >
                <div>
                  <p className="text-[var(--foreground)] text-[14px] font-bold leading-tight capitalize">
                    {card.label.toLowerCase()}
                  </p>
                  <p className="text-gray-400 dark:text-[var(--color-sage)] text-[11px] mt-0.5">explorar</p>
                </div>
                <ArrowRight size={13} className="absolute top-3 right-3 text-gray-300 dark:text-white/20 group-hover:text-[var(--color-teal)] transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}