import Link from 'next/link'

type SubCard = { emoji: string; label: string; href: string }
type Section = { title: string; subtitle: string; href: string; cards: SubCard[] }

const SECTIONS: Section[] = [
  {
    title: 'roupas',
    subtitle: 'como crescem rápido!',
    href: '/search?dept=criancas&cat=roupas',
    cards: [
      { emoji: '🍼', label: 'bebês', href: '/search?dept=criancas&cat=roupas&sub=body' },
      { emoji: '👗', label: 'vestidos', href: '/search?dept=criancas&cat=roupas&sub=vestidos' },
      { emoji: '👖', label: 'calças', href: '/search?dept=criancas&cat=roupas&sub=calcas' },
      { emoji: '🧥', label: 'casacos', href: '/search?dept=criancas&cat=roupas&sub=casacos' },
      { emoji: '🩱', label: 'conjuntos', href: '/search?dept=criancas&cat=roupas&sub=conjuntos' },
      { emoji: '🛌', label: 'pijamas', href: '/search?dept=criancas&cat=roupas&sub=pijamas' },
    ],
  },
  {
    title: 'brinquedos',
    subtitle: 'diversão garantida',
    href: '/search?dept=criancas&cat=brinquedos',
    cards: [
      { emoji: '🧸', label: 'pelúcias', href: '/search?dept=criancas&cat=brinquedos&sub=pelucias' },
      { emoji: '📚', label: 'educativos', href: '/search?dept=criancas&cat=brinquedos&sub=educativos' },
      { emoji: '🎯', label: 'aventura', href: '/search?dept=criancas&cat=brinquedos&sub=esporte-e-lazer' },
      { emoji: '🎨', label: 'artísticos', href: '/search?dept=criancas&cat=brinquedos&sub=artisticos' },
      { emoji: '🏠', label: 'casinha', href: '/search?dept=criancas&cat=brinquedos&sub=casinha' },
    ],
  },
  {
    title: 'calçados',
    subtitle: 'passitos que importam',
    href: '/search?dept=criancas&cat=calcados',
    cards: [
      { emoji: '👟', label: 'tênis', href: '/search?dept=criancas&cat=calcados&sub=tenis' },
      { emoji: '👡', label: 'sandálias', href: '/search?dept=criancas&cat=calcados&sub=sandalias' },
      { emoji: '👢', label: 'botas', href: '/search?dept=criancas&cat=calcados&sub=botas' },
      { emoji: '🥿', label: 'sapatilhas', href: '/search?dept=criancas&cat=calcados&sub=sapatilhas' },
      { emoji: '🥾', label: 'sapatos', href: '/search?dept=criancas&cat=calcados&sub=sapatos' },
    ],
  },
  {
    title: 'acessórios e enxoval',
    subtitle: 'tudo para o bebê',
    href: '/search?dept=criancas&cat=acessorios-e-enxoval',
    cards: [
      { emoji: '🛏️', label: 'cama/berço', href: '/search?dept=criancas&cat=acessorios-e-enxoval&sub=cama-berco-banho' },
      { emoji: '🤱', label: 'maternidade', href: '/search?dept=criancas&cat=acessorios-e-enxoval&sub=maternidade' },
      { emoji: '👜', label: 'bolsas', href: '/search?dept=criancas&cat=acessorios-e-enxoval&sub=bolsas' },
      { emoji: '💺', label: 'cadeirinhas', href: '/search?dept=criancas&cat=acessorios-e-enxoval&sub=cadeirinhas' },
    ],
  },
]

export default function KidsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="px-5 pt-8 pb-6 border-b border-gray-100 dark:border-white/5">
        <p className="text-[11px] font-bold text-[var(--color-teal)] uppercase tracking-widest mb-2">departamento</p>
        <h1 className="text-[42px] font-black text-[var(--foreground)] leading-none mb-2">crianças</h1>
        <p className="text-[14px] text-gray-500 dark:text-white/50">tem que aproveitar muito essa fase 🧸</p>
      </div>

      <div className="py-8 space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <div className="flex items-baseline justify-between px-5 mb-4">
              <div>
                <h2 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">{section.title}</h2>
                <p className="text-[13px] text-gray-500 dark:text-white/40 mt-0.5">{section.subtitle}</p>
              </div>
              <Link href={section.href} className="text-[12px] font-bold text-[var(--color-teal)] whitespace-nowrap">
                ver tudo →
              </Link>
            </div>
            <div
              className="flex gap-3 overflow-x-auto pb-3 px-5 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: 'none' }}
            >
              {section.cards.map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="flex-shrink-0 flex flex-col items-center justify-center gap-2 w-[88px] h-[88px] bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 rounded-2xl shadow-sm hover:scale-[1.04] active:scale-[0.97] transition-transform"
                >
                  <span className="text-[28px] leading-none">{card.emoji}</span>
                  <span className="text-[11px] font-bold text-[var(--foreground)] text-center leading-tight px-1">
                    {card.label}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}