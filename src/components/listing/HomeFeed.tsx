'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shirt, Footprints, Watch, Smartphone, Sofa, Package, ArrowRight, Tag } from 'lucide-react'
import type { ListingWithDetails, CategoryOption } from '@/types/listing'
import { CategoryFilter } from './CategoryFilter'
import { ListingGrid } from './ListingGrid'

type Props = {
  listings: ListingWithDetails[]
  categories: CategoryOption[]
}

const categoryIcons: Record<string, React.ReactNode> = {
  roupas: <Shirt size={28} />,
  calcados: <Footprints size={28} />,
  acessorios: <Watch size={28} />,
  eletronicos: <Smartphone size={28} />,
  casa: <Sofa size={28} />,
  outros: <Package size={28} />,
}

export function HomeFeed({ listings, categories }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const filtered =
    selectedCategory === null
      ? listings
      : listings.filter((l) => l.category.slug === selectedCategory)

  const highlighted = listings.filter((l) => l.condition === 'LIKE_NEW' || l.condition === 'NEW').slice(0, 4)
  const recent = listings.slice(0, 8)

  return (
    <div className="space-y-10">
      {/* ── Hero banner ── */}
      <section className="relative overflow-hidden rounded-2xl bg-airforce text-linen">
        <div className="flex flex-col md:flex-row items-center">
          {/* Text side */}
          <div className="flex-1 p-8 md:p-12 space-y-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-celadon">
              novidade
            </p>
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              anuncie 5 produtos<br />
              <span className="text-celadon">ganhe R$ 30 de crédito</span>
            </h1>
            <p className="text-sm text-linen/70 max-w-sm">
              verifique se a promoção está disponível na sua central de vendas
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/vender"
                className="inline-flex items-center gap-2 bg-teal text-linen font-bold px-6 py-3 rounded-full hover:bg-celadon hover:text-airforce transition-colors"
              >
                <Tag size={16} />
                botar pra vender
              </Link>
              <Link
                href="/como-funciona"
                className="text-sm text-linen/60 hover:text-linen underline underline-offset-2 transition-colors"
              >
                saiba mais
              </Link>
            </div>
          </div>

          {/* Visual side */}
          <div className="hidden md:flex w-64 h-64 items-center justify-center opacity-10 text-[180px] select-none pr-8">
            🏷️
          </div>

          {/* Deadline pill */}
          <div className="md:absolute md:top-8 md:right-8 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 mx-8 mb-8 md:mx-0 md:mb-0">
            <span className="text-2xl font-black text-celadon">até 15/04</span>
            <span className="text-xs text-linen/60">saldo cai em até 48h</span>
          </div>
        </div>
      </section>

      {/* ── Categories shortcuts ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-airforce">categorias</h2>
          <Link href="/categorias" className="text-sm text-teal hover:text-airforce flex items-center gap-1 transition-colors">
            ver todas <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
                selectedCategory === cat.slug
                  ? 'bg-airforce text-linen border-airforce'
                  : 'bg-white text-airforce border-teal-muted/20 hover:border-teal hover:text-teal'
              }`}
            >
              <span className="text-2xl">
                {categoryIcons[cat.slug] ?? <Package size={28} />}
              </span>
              <span className="text-xs font-semibold">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Produtos em destaque ── */}
      {highlighted.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-bold text-airforce">produtos em destaque</h2>
            <Link href="/buscar?condicao=seminovo" className="text-sm text-teal hover:text-airforce flex items-center gap-1 transition-colors">
              espiar <ArrowRight size={14} />
            </Link>
          </div>
          <p className="text-xs text-teal-muted mb-4">seminovos e novos selecionados</p>
          <ListingGrid listings={highlighted} />
        </section>
      )}

      {/* ── Feed principal ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-airforce">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name ?? 'produtos'
              : 'todos os produtos'}
          </h2>
          <span className="text-xs text-teal-muted">{filtered.length} anúncio{filtered.length !== 1 ? 's' : ''}</span>
        </div>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
        />
        <div className="mt-4">
          <ListingGrid listings={filtered} />
        </div>
      </section>

      {/* ── CTA venda ── */}
      <section className="rounded-2xl bg-celadon/30 border border-celadon p-8 text-center space-y-3">
        <h2 className="text-xl font-black text-airforce">seu armário cheio?</h2>
        <p className="text-sm text-teal-muted max-w-sm mx-auto">
          Venda o que você não usa mais e ganhe dinheiro sem sair de casa.
          Anunciar na T-Hex Garage é grátis.
        </p>
        <Link
          href="/vender"
          className="inline-flex items-center gap-2 bg-airforce text-linen font-bold px-8 py-3 rounded-full hover:bg-teal transition-colors"
        >
          <Tag size={16} />
          criar meu anúncio agora
        </Link>
      </section>
    </div>
  )
}
