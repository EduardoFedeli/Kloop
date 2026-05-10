import Link from 'next/link'

type SubCard = { emoji: string; label: string; href: string }
type Section = { title: string; subtitle: string; href: string; cards: SubCard[] }

const SECTIONS: Section[] = [
  {
    title: 'roupas',
    subtitle: 'do básico ao fashion',
    href: '/search?dept=mocas&cat=roupas',
    cards: [
      { emoji: '👗', label: 'vestidos', href: '/search?dept=mocas&cat=roupas&sub=vestidos' },
      { emoji: '👖', label: 'calças', href: '/search?dept=mocas&cat=roupas&sub=calcas' },
      { emoji: '👚', label: 'blusas', href: '/search?dept=mocas&cat=roupas&sub=blusas' },
      { emoji: '🧥', label: 'casacos', href: '/search?dept=mocas&cat=roupas&sub=casacos-e-jaquetas' },
      { emoji: '🩱', label: 'saias', href: '/search?dept=mocas&cat=roupas&sub=saias' },
      { emoji: '🩲', label: 'shorts', href: '/search?dept=mocas&cat=roupas&sub=shorts' },
    ],
  },
  {
    title: 'beleza',
    subtitle: 'cuidando da gente',
    href: '/search?dept=mocas&cat=beleza',
    cards: [
      { emoji: '💄', label: 'maquiagens', href: '/search?dept=mocas&cat=beleza&sub=maquiagens' },
      { emoji: '🧴', label: 'skincare', href: '/search?dept=mocas&cat=beleza&sub=skincare' },
      { emoji: '🌸', label: 'perfumes', href: '/search?dept=mocas&cat=beleza&sub=perfumes' },
      { emoji: '💇‍♀️', label: 'cabelos', href: '/search?dept=mocas&cat=beleza&sub=cabelos' },
      { emoji: '💅', label: 'unhas', href: '/search?dept=mocas&cat=beleza&sub=unhas' },
    ],
  },
  {
    title: 'bolsas',
    subtitle: 'para carregar com estilo',
    href: '/search?dept=mocas&cat=bolsas',
    cards: [
      { emoji: '👜', label: 'de ombro', href: '/search?dept=mocas&cat=bolsas&sub=ombro' },
      { emoji: '🎒', label: 'mochilas', href: '/search?dept=mocas&cat=bolsas&sub=mochilas' },
      { emoji: '👛', label: 'clutch', href: '/search?dept=mocas&cat=bolsas&sub=clutch' },
      { emoji: '🛍️', label: 'tote', href: '/search?dept=mocas&cat=bolsas&sub=tote' },
      { emoji: '💼', label: 'crossbody', href: '/search?dept=mocas&cat=bolsas&sub=crossbody' },
    ],
  },
  {
    title: 'calçados',
    subtitle: 'da sapatilha ao salto',
    href: '/search?dept=mocas&cat=calcados',
    cards: [
      { emoji: '👟', label: 'tênis', href: '/search?dept=mocas&cat=calcados&sub=tenis' },
      { emoji: '👢', label: 'botas', href: '/search?dept=mocas&cat=calcados&sub=botas' },
      { emoji: '👡', label: 'sandálias', href: '/search?dept=mocas&cat=calcados&sub=sandalias' },
      { emoji: '👠', label: 'sapatos', href: '/search?dept=mocas&cat=calcados&sub=sapatos' },
      { emoji: '🥿', label: 'mules', href: '/search?dept=mocas&cat=calcados&sub=mules' },
    ],
  },
  {
    title: 'acessórios',
    subtitle: 'detalhes que fazem diferença',
    href: '/search?dept=mocas&cat=acessorios',
    cards: [
      { emoji: '👓', label: 'óculos', href: '/search?dept=mocas&cat=acessorios&sub=oculos' },
      { emoji: '⌚', label: 'relógios', href: '/search?dept=mocas&cat=acessorios&sub=relogios' },
      { emoji: '💍', label: 'jóias', href: '/search?dept=mocas&cat=acessorios&sub=joias-e-bijuterias' },
      { emoji: '🧣', label: 'cachecóis', href: '/search?dept=mocas&cat=acessorios&sub=cachacois' },
      { emoji: '🎩', label: 'chapéus', href: '/search?dept=mocas&cat=acessorios&sub=chapeus' },
    ],
  },
]

export default function MocasPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="px-5 pt-8 pb-6 border-b border-gray-100 dark:border-white/5">
        <p className="text-[11px] font-bold text-[var(--color-teal)] uppercase tracking-widest mb-2">departamento</p>
        <h1 className="text-[42px] font-black text-[var(--foreground)] leading-none mb-2">moças</h1>
        <p className="text-[14px] text-gray-500 dark:text-white/50">tudo de melhor para você ✨</p>
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