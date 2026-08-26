import Link from 'next/link'
import type { ComponentType } from 'react'
import { SofaIcon, CamaIcon, MesaJantarIcon, EscritorioIcon, VarandaIcon, QuadroIcon, EspelhoIcon, TapeteIcon, CortinaIcon, LencolIcon, TravesseiroIcon, PanelaIcon, FormaIcon, CopoIcon, LuminariaIcon, AbajurIcon, VelaIcon, FlorIcon, CobertorIcon, ToalhaIcon, XicaraIcon, TalherIcon, LustreIcon } from '@/components/icons/CustomIcons'

type IconComponent = ComponentType<{ size?: number; className?: string }>
type SubCard = { emoji: string; icon?: IconComponent; label: string; href: string }
type Section = { title: string; subtitle: string; href: string; cards: SubCard[] }

const SECTIONS: Section[] = [
  {
    title: 'móveis',
    subtitle: 'transforme seu espaço',
    href: '/search?dept=casa-e-decor&cat=moveis',
    cards: [
      { emoji: '🛋️', icon: SofaIcon, label: 'sala de estar', href: '/search?dept=casa-e-decor&cat=moveis&sub=sala-de-tv-e-estar' },
      { emoji: '🛏️', icon: CamaIcon, label: 'quartos', href: '/search?dept=casa-e-decor&cat=moveis&sub=quartos' },
      { emoji: '🍽️', icon: MesaJantarIcon, label: 'sala de jantar', href: '/search?dept=casa-e-decor&cat=moveis&sub=sala-de-jantar' },
      { emoji: '🖥️', icon: EscritorioIcon, label: 'escritório', href: '/search?dept=casa-e-decor&cat=moveis&sub=escritorio' },
      { emoji: '🍳', icon: PanelaIcon, label: 'cozinha', href: '/search?dept=casa-e-decor&cat=moveis&sub=cozinha' },
      { emoji: '🌿', icon: VarandaIcon, label: 'varanda', href: '/search?dept=casa-e-decor&cat=moveis&sub=varanda-e-jardim' },
    ],
  },
  {
    title: 'decoração e enfeites',
    subtitle: 'personalidade em cada canto',
    href: '/search?dept=casa-e-decor&cat=decoracao-e-enfeites',
    cards: [
      { emoji: '🖼️', icon: QuadroIcon, label: 'quadros', href: '/search?dept=casa-e-decor&cat=decoracao-e-enfeites&sub=adornos' },
      { emoji: '🪞', icon: EspelhoIcon, label: 'espelhos', href: '/search?dept=casa-e-decor&cat=decoracao-e-enfeites&sub=espelhos' },
      { emoji: '🕯️', icon: VelaIcon, label: 'velas', href: '/search?dept=casa-e-decor&cat=decoracao-e-enfeites&sub=velas' },
      { emoji: '🌸', icon: FlorIcon, label: 'flores', href: '/search?dept=casa-e-decor&cat=decoracao-e-enfeites&sub=flores' },
      { emoji: '🪡', icon: TapeteIcon, label: 'tapetes', href: '/search?dept=casa-e-decor&cat=decoracao-e-enfeites&sub=tapetes' },
      { emoji: '🏮', icon: CortinaIcon, label: 'cortinas', href: '/search?dept=casa-e-decor&cat=decoracao-e-enfeites&sub=cortinas' },
    ],
  },
  {
    title: 'cama, mesa e banho',
    subtitle: 'conforto no dia a dia',
    href: '/search?dept=casa-e-decor&cat=cama-mesa-banho',
    cards: [
      { emoji: '🛌', icon: LencolIcon, label: 'lençóis', href: '/search?dept=casa-e-decor&cat=cama-mesa-banho&sub=lencois' },
      { emoji: '🧸', icon: CobertorIcon, label: 'cobertores', href: '/search?dept=casa-e-decor&cat=cama-mesa-banho&sub=cobertores' },
      { emoji: '😴', icon: TravesseiroIcon, label: 'travesseiros', href: '/search?dept=casa-e-decor&cat=cama-mesa-banho&sub=travesseiros' },
      { emoji: '🚿', icon: ToalhaIcon, label: 'toalhas', href: '/search?dept=casa-e-decor&cat=cama-mesa-banho&sub=toalhas' },
    ],
  },
  {
    title: 'utensílios para cozinha',
    subtitle: 'cozinhar com prazer',
    href: '/search?dept=casa-e-decor&cat=utensilios-para-cozinha',
    cards: [
      { emoji: '🍳', icon: PanelaIcon, label: 'panelas', href: '/search?dept=casa-e-decor&cat=utensilios-para-cozinha&sub=panelas' },
      { emoji: '🍴', icon: TalherIcon, label: 'talheres', href: '/search?dept=casa-e-decor&cat=utensilios-para-cozinha&sub=talheres' },
      { emoji: '☕', icon: XicaraIcon, label: 'xícaras', href: '/search?dept=casa-e-decor&cat=utensilios-para-cozinha&sub=xicaras' },
      { emoji: '🥣', icon: FormaIcon, label: 'formas', href: '/search?dept=casa-e-decor&cat=utensilios-para-cozinha&sub=formas' },
      { emoji: '🧃', icon: CopoIcon, label: 'copos', href: '/search?dept=casa-e-decor&cat=utensilios-para-cozinha&sub=copos' },
    ],
  },
  {
    title: 'iluminação',
    subtitle: 'o ambiente certo',
    href: '/search?dept=casa-e-decor&cat=iluminacao',
    cards: [
      { emoji: '💡', icon: LuminariaIcon, label: 'luminárias', href: '/search?dept=casa-e-decor&cat=iluminacao&sub=luminarias' },
      { emoji: '🔆', icon: LustreIcon, label: 'lustres', href: '/search?dept=casa-e-decor&cat=iluminacao&sub=lustres' },
      { emoji: '🕯️', icon: AbajurIcon, label: 'abajures', href: '/search?dept=casa-e-decor&cat=iluminacao&sub=abajures' },
      { emoji: '✨', label: 'fitas LED', href: '/search?dept=casa-e-decor&cat=iluminacao&sub=fitas-de-led' },
    ],
  },
]

export default function CasaPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="px-5 pt-8 pb-6 border-b border-gray-100 dark:border-white/5">
        <p className="text-[11px] font-bold text-[var(--color-teal)] uppercase tracking-widest mb-2">departamento</p>
        <h1 className="text-[42px] font-black text-[var(--foreground)] leading-none mb-2">casa & decor</h1>
        <p className="text-[14px] text-gray-500 dark:text-white/50">seu espaço, sua personalidade 🛋️</p>
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
                  {card.icon ? (
                    <card.icon size={26} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
                  ) : (
                    <span className="text-[28px] leading-none">{card.emoji}</span>
                  )}
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