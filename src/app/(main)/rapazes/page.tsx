import Link from 'next/link'
import type { ComponentType } from 'react'
import { CalcaIcon, BlusaIcon, CasacoIcon, ShortsIcon, TernoIcon, PerfumeIcon, TenisIcon, OculosIcon, CamisaSocialIcon, SkincareIcon, CabeloIcon, MochilaIcon, MaletaIcon, RelogioIcon, CarteiraIcon, ChapeuIcon, JoiaIcon, SapatoSocialIcon, ChineloIcon } from '@/components/icons/CustomIcons'

type IconComponent = ComponentType<{ size?: number; className?: string }>
type SubCard = { emoji: string; icon?: IconComponent; label: string; href: string }
type Section = { title: string; subtitle: string; href: string; cards: SubCard[] }

const SECTIONS: Section[] = [
  {
    title: 'roupas',
    subtitle: 'do básico ao estiloso',
    href: '/search?dept=rapazes&cat=roupas',
    cards: [
      { emoji: '👔', icon: CamisaSocialIcon, label: 'camisas', href: '/search?dept=rapazes&cat=roupas&sub=camisas' },
      { emoji: '👕', icon: BlusaIcon, label: 'blusas', href: '/search?dept=rapazes&cat=roupas&sub=blusas' },
      { emoji: '👖', icon: CalcaIcon, label: 'calças', href: '/search?dept=rapazes&cat=roupas&sub=calcas' },
      { emoji: '🩳', icon: ShortsIcon, label: 'shorts', href: '/search?dept=rapazes&cat=roupas&sub=shorts' },
      { emoji: '🧥', icon: CasacoIcon, label: 'casacos', href: '/search?dept=rapazes&cat=roupas&sub=casacos' },
      { emoji: '🤵', icon: TernoIcon, label: 'ternos', href: '/search?dept=rapazes&cat=roupas&sub=ternos' },
    ],
  },
  {
    title: 'calçados',
    subtitle: 'para andar com estilo',
    href: '/search?dept=rapazes&cat=calcados',
    cards: [
      { emoji: '👟', icon: TenisIcon, label: 'tênis', href: '/search?dept=rapazes&cat=calcados&sub=tenis' },
      { emoji: '👢', label: 'botas', href: '/search?dept=rapazes&cat=calcados&sub=botas' },
      { emoji: '🥾', icon: SapatoSocialIcon, label: 'sapatos', href: '/search?dept=rapazes&cat=calcados&sub=sapatos' },
      { emoji: '🩴', label: 'sandálias', href: '/search?dept=rapazes&cat=calcados&sub=sandalias' },
      { emoji: '🩴', icon: ChineloIcon, label: 'chinelos', href: '/search?dept=rapazes&cat=calcados&sub=chinelos' },
    ],
  },
  {
    title: 'acessórios',
    subtitle: 'finalizando o look',
    href: '/search?dept=rapazes&cat=acessorios',
    cards: [
      { emoji: '⌚', icon: RelogioIcon, label: 'relógios', href: '/search?dept=rapazes&cat=acessorios&sub=relogios' },
      { emoji: '👓', icon: OculosIcon, label: 'óculos', href: '/search?dept=rapazes&cat=acessorios&sub=oculos' },
      { emoji: '👛', icon: CarteiraIcon, label: 'carteiras', href: '/search?dept=rapazes&cat=acessorios&sub=carteiras' },
      { emoji: '🎩', icon: ChapeuIcon, label: 'chapéus', href: '/search?dept=rapazes&cat=acessorios&sub=chapeus' },
      { emoji: '💍', icon: JoiaIcon, label: 'jóias', href: '/search?dept=rapazes&cat=acessorios&sub=joias-e-bijuterias' },
    ],
  },
  {
    title: 'beleza',
    subtitle: 'cuidados que valem',
    href: '/search?dept=rapazes&cat=beleza',
    cards: [
      { emoji: '🌸', icon: PerfumeIcon, label: 'perfumes', href: '/search?dept=rapazes&cat=beleza&sub=perfumes' },
      { emoji: '🧴', icon: SkincareIcon, label: 'skincare', href: '/search?dept=rapazes&cat=beleza&sub=skincare' },
      { emoji: '💇', icon: CabeloIcon, label: 'cabelos', href: '/search?dept=rapazes&cat=beleza&sub=cabelos' },
    ],
  },
  {
    title: 'bolsas',
    subtitle: 'para levar no dia a dia',
    href: '/search?dept=rapazes&cat=bolsas',
    cards: [
      { emoji: '🎒', icon: MochilaIcon, label: 'mochilas', href: '/search?dept=rapazes&cat=bolsas&sub=mochilas' },
      { emoji: '💼', icon: MaletaIcon, label: 'maleta', href: '/search?dept=rapazes&cat=bolsas&sub=maleta' },
      { emoji: '🛍️', label: 'pochete', href: '/search?dept=rapazes&cat=bolsas&sub=pochete' },
    ],
  },
]

export default function RapazesPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="px-5 pt-8 pb-6 border-b border-gray-100 dark:border-white/5">
        <p className="text-[11px] font-bold text-[var(--color-teal)] uppercase tracking-widest mb-2">departamento</p>
        <h1 className="text-[42px] font-black text-[var(--foreground)] leading-none mb-2">Masculino</h1>
        <p className="text-[14px] text-gray-500 dark:text-white/50">estilo de qualidade por menos 👕</p>
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