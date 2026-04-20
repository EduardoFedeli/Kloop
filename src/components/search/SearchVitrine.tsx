"use client"

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { GlobalSearchBar } from './GlobalSearchBar'

// Mapeamento completo baseado no seu categorias.csv
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

const MARCAS_QUERIDINHAS = [
  { name: 'zara', logo: 'ZARA' },
  { name: 'farm', logo: 'FARM' },
  { name: 'arezzo', logo: 'AREZZO' },
  { name: 'schutz', logo: 'SCHUTZ' },
  { name: 'nike', logo: 'NIKE' },
]

const DESTAQUES_PILLS = [
  { label: 'venda no kloop', href: '/create' },
  { label: 'perfumes até 60%', href: '/search?cat=perfumes&discount=60' },
  { label: 'vestidos até R$ 99', href: '/search?cat=vestidos&maxPrice=9900' },
  { label: 'apple até 40% off', href: '/search?brand=Apple&discount=40' },
  { label: 'cupons do dia', href: '/search?sort=discount' },
  { label: 'novidades do dia', href: '/search?sort=recent' },
]

export function SearchVitrine() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      {/* Barra de Busca Exclusiva da Página (Usa o GlobalSearchBar) */}
      <div className="sticky top-0 z-20 bg-[var(--background)] pt-4 pb-3 px-4">
        <GlobalSearchBar 
          autoFocus={true} 
          showBackButton={true} 
          placeholder='o que você está procurando?' 
        />
      </div>

      <div className="px-4 mt-6 space-y-12">
        
        {/* Seção Categorias (Scroll Horizontal Infinito) */}
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

        {/* Marcas Queridinhas (Scroll Horizontal Infinito) */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">marcas queridinhas</h2>
            <Link href="/search?sort=popular_brands" className="text-[var(--color-teal)]">
              <ChevronRight size={20} strokeWidth={3} />
            </Link>
          </div>
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {MARCAS_QUERIDINHAS.map((marca) => (
              <Link key={marca.name} href={`/search?brand=${marca.name}`} className="flex flex-col items-center gap-2 flex-shrink-0 group">
                <div className="w-20 h-20 bg-white dark:bg-[var(--color-pine)] rounded-full shadow-sm border border-gray-100 dark:border-white/5 flex items-center justify-center group-hover:border-[var(--color-teal)] transition-colors overflow-hidden">
                   <span className="text-[12px] font-black tracking-tighter text-[var(--foreground)] uppercase">{marca.logo}</span>
                </div>
                <span className="text-[12px] font-bold text-[var(--foreground)]">{marca.name}</span>
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