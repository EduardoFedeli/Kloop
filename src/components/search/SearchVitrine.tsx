"use client"

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { GlobalSearchBar } from './GlobalSearchBar'

const FALLBACK_BRANDS = [
  { name: 'ZARA', slug: 'zara' },
  { name: 'FARM', slug: 'farm' },
  { name: 'AREZZO', slug: 'arezzo' },
  { name: 'SCHUTZ', slug: 'schutz' },
  { name: 'NIKE', slug: 'nike' },
]

const DEPARTAMENTOS = [
  { name: 'moças', icon: '👗', slug: 'mocas' },
  { name: 'rapazes', icon: '👕', slug: 'rapazes' },
  { name: 'crianças', icon: '🧸', slug: 'criancas' },
  { name: 'casa & decor', icon: '🛋️', slug: 'casa-e-decor' },
  { name: 'eletrônicos', icon: '📱', slug: 'eletronicos' },
  { name: 'eletrodom...', icon: '🍳', slug: 'eletrodomesticos' },
  { name: 'livros & p...', icon: '📚', slug: 'livros-e-papelarias' },
  { name: 'antiguida...', icon: '🏺', slug: 'antiguidades' },
  { name: 'pets', icon: '🐶', slug: 'pets' },
  { name: 'etc & tal', icon: '✨', slug: 'etc-e-tal' },
]

const DESTAQUES_PILLS = [
  // Usa o departamento "mocas", a categoria "vestidos" (ou busca q=vestidos) e limite de 200 reais
  { label: 'vestidos até R$ 200', href: '/search?dept=mocas&cat=vestidos&maxPrice=200' },
  
  // Combina filtro de marca (Apple) com range de preço (1000 a 5000)
  { label: 'apple entre R$ 1k e 5k', href: '/search?brand=Apple&minPrice=1000&maxPrice=5000' },
  
  // Vai direto pro departamento de moças
  { label: 'moda feminina', href: '/search?dept=mocas' },
  
  // Vai direto pro departamento de rapazes
  { label: 'moda masculina', href: '/search?dept=rapazes' },
]

interface Props {
  topBrands?: { name: string; slug: string }[]
}

export function SearchVitrine({ topBrands = [] }: Props) {
  const displayBrands = topBrands.length > 0 ? topBrands.slice(0, 8) : FALLBACK_BRANDS

  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Barra de Busca Exclusiva da Página */}
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

        {/* Marcas Queridinhas Dinâmicas */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">marcas queridinhas</h2>
            <Link href="/search?sort=popular_brands" className="text-[var(--color-teal)]">
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
                   <span className="text-[12px] font-black tracking-tighter text-white uppercase px-2 text-center break-words w-full line-clamp-2">
                     {brand.name}
                   </span>
                </div>
                <span className="text-[12px] font-bold text-[var(--foreground)] w-20 text-center truncate">
                  {brand.name.toLowerCase()}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Destaques (Pills Coloridas) */}
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