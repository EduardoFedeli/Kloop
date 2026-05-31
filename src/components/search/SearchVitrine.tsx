"use client"

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { GlobalSearchBar } from './GlobalSearchBar'

const FALLBACK_BRANDS = [
  { name: 'ZARA', slug: 'zara', logoUrl: null },
  { name: 'FARM', slug: 'farm', logoUrl: null },
  { name: 'AREZZO', slug: 'arezzo', logoUrl: null },
  { name: 'SCHUTZ', slug: 'schutz', logoUrl: null },
  { name: 'NIKE', slug: 'nike', logoUrl: null },
]

const DEPARTAMENTOS = [
  { name: 'moças', icon: '👗', slug: 'mocas' },
  { name: 'rapazes', icon: '👕', slug: 'rapazes' },
  { name: 'crianças', icon: '🧸', slug: 'criancas' },
  { name: 'casa & decor', icon: '🛋️', slug: 'casa-e-decoracao' },
  { name: 'eletrônicos', icon: '📱', slug: 'eletronicos' },
  { name: 'eletrodom...', icon: '🍳', slug: 'eletrodomesticos' },
  { name: 'livros & p...', icon: '📚', slug: 'livros-e-papelarias' },
  { name: 'antiguida...', icon: '🏺', slug: 'antiguidades' },
  { name: 'pets', icon: '🐶', slug: 'pets' },
  { name: 'etc & tal', icon: '✨', slug: 'etc-e-tal' },
]

const DESTAQUES_PILLS = [
  { label: 'vestidos até R$ 200', href: '/search?dept=mocas&cat=vestidos&maxPrice=200' },
  { label: 'apple entre R$ 1k e 5k', href: '/search?brand=Apple&minPrice=1000&maxPrice=5000' },
  { label: 'moda feminina', href: '/search?dept=mocas' },
  { label: 'moda masculina', href: '/search?dept=rapazes' },
]

const TENDENCIAS = [
  { label: 'tênis running', href: '/search?q=tênis+running' },
  { label: 'jaqueta jeans', href: '/search?q=jaqueta+jeans' },
  { label: 'bolsa de couro', href: '/search?q=bolsa+de+couro' },
  { label: 'vestido midi', href: '/search?q=vestido+midi' },
  { label: 'camisa polo', href: '/search?q=camisa+polo' },
  { label: 'notebook usado', href: '/search?q=notebook&dept=eletronicos' },
]

interface BrandPreview {
  name: string
  slug: string
  logoUrl?: string | null
}

interface Props {
  topBrands?: BrandPreview[]
}

export function SearchVitrine({ topBrands = [] }: Props) {
  const displayBrands = topBrands.length > 0 ? topBrands.slice(0, 8) : FALLBACK_BRANDS

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Barra de Busca */}
      <div className="sticky top-0 z-20 bg-[var(--background)] pt-4 pb-3 px-4">
        <GlobalSearchBar
          autoFocus={true}
          showBackButton={true}
          placeholder='o que você está procurando?'
        />
      </div>

      <div className="px-4 mt-6 space-y-12">

        {/* Seção Categorias */}
        <section>
          <h2 className="text-[17px] font-black text-[var(--foreground)] mb-5 tracking-tight">categorias</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {DEPARTAMENTOS.map((cat) => (
              <Link key={cat.slug} href={`/search?dept=${cat.slug}`} className="flex flex-col items-center gap-2 group flex-shrink-0">
                <div className="w-[72px] h-[72px] bg-white dark:bg-[var(--color-pine)] rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform">
                  {cat.icon}
                </div>
                <span className="text-[12px] font-bold text-[var(--foreground)] text-center leading-tight truncate w-full max-w-[72px]">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Marcas Queridinhas — seta leva para /marcas */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">marcas queridinhas</h2>
            <Link href="/marcas" className="text-[var(--color-teal)] hover:opacity-70 transition-opacity">
              <ChevronRight size={20} strokeWidth={3} />
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {displayBrands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/marca/${brand.slug}`}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
              >
                <div className="w-20 h-20 bg-[var(--color-pine)] rounded-full shadow-sm flex items-center justify-center hover:opacity-90 transition-opacity overflow-hidden">
                  {brand.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={brand.logoUrl} alt={brand.name} className="w-full h-full object-contain p-2" />
                  ) : (
                    <span className="text-[12px] font-black tracking-tighter text-white uppercase px-2 text-center break-words w-full line-clamp-2">
                      {brand.name}
                    </span>
                  )}
                </div>
                <span className="text-[12px] font-bold text-[var(--foreground)] w-20 text-center truncate">
                  {brand.name.toLowerCase()}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Tendências da semana */}
        <section>
          <div className="flex items-center gap-2 mb-5">
            <h2 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">tendências da semana</h2>
            <span className="bg-[var(--color-teal)]/15 text-[var(--color-teal)] dark:bg-[var(--color-celadon)]/15 dark:text-[var(--color-celadon)] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide">
              🔥 em alta
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TENDENCIAS.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                className="flex items-center gap-1.5 bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 text-[var(--foreground)] font-bold text-[13px] px-3.5 py-2 rounded-full hover:border-[var(--color-teal)]/40 hover:text-[var(--color-teal)] transition-all"
              >
                <span className="text-[11px]">🔍</span>
                {t.label}
              </Link>
            ))}
          </div>
        </section>

        {/* Destaques */}
        <section>
          <h2 className="text-[17px] font-black text-[var(--foreground)] mb-5 tracking-tight">destaques</h2>
          <div className="flex flex-wrap gap-2.5">
            {DESTAQUES_PILLS.map((pill) => (
              <Link
                key={pill.label}
                href={pill.href}
                className="bg-[#e9f5db] dark:bg-[var(--color-teal)]/20 text-[var(--color-pine)] dark:text-[var(--color-celadon)] font-bold text-[13px] px-4 py-3 rounded-lg hover:brightness-95 transition-all"
              >
                {pill.label}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}
