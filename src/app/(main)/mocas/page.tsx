import Link from 'next/link'
import type { ComponentType } from 'react'
import { VestidoIcon, CalcaIcon, BlusaIcon, CasacoIcon, SaiaIcon, ShortsIcon, PerfumeIcon, TenisIcon, BolsaIcon, OculosIcon, MaquiagemIcon, SkincareIcon, CabeloIcon, UnhaIcon, MochilaIcon, ClutchIcon, ToteIcon, CrossbodyIcon, SandaliaIcon, MuleIcon, RelogioIcon, ChapeuIcon, JoiaIcon, SapatoSocialIcon, CachecolIcon, BotaIcon } from '@/components/icons/CustomIcons'
import { CategoryScrollRow } from '@/components/listing/CategoryScrollRow'

type IconComponent = ComponentType<{ size?: number; className?: string }>
type SubCard = { emoji: string; icon?: IconComponent; label: string; href: string }
type Section = { title: string; subtitle: string; href: string; cards: SubCard[] }

function renderCard(card: SubCard) {
  return {
    label: card.label,
    href: card.href,
    icon: card.icon
      ? <card.icon size={26} className="text-[var(--color-teal)] dark:text-[var(--color-celadon)]" />
      : <span className="text-[28px] leading-none">{card.emoji}</span>,
  }
}

const SECTIONS: Section[] = [
  {
    title: 'roupas',
    subtitle: 'do básico ao fashion',
    href: '/search?dept=mocas&cat=roupas',
    cards: [
      { emoji: '👗', icon: VestidoIcon, label: 'vestidos', href: '/search?dept=mocas&cat=roupas&sub=vestidos' },
      { emoji: '👖', icon: CalcaIcon, label: 'calças', href: '/search?dept=mocas&cat=roupas&sub=calcas' },
      { emoji: '👚', icon: BlusaIcon, label: 'blusas', href: '/search?dept=mocas&cat=roupas&sub=blusas' },
      { emoji: '🧥', icon: CasacoIcon, label: 'casacos', href: '/search?dept=mocas&cat=roupas&sub=casacos-e-jaquetas' },
      { emoji: '🩱', icon: SaiaIcon, label: 'saias', href: '/search?dept=mocas&cat=roupas&sub=saias' },
      { emoji: '🩲', icon: ShortsIcon, label: 'shorts', href: '/search?dept=mocas&cat=roupas&sub=shorts' },
    ],
  },
  {
    title: 'beleza',
    subtitle: 'cuidando da gente',
    href: '/search?dept=mocas&cat=beleza',
    cards: [
      { emoji: '💄', icon: MaquiagemIcon, label: 'maquiagens', href: '/search?dept=mocas&cat=beleza&sub=maquiagens' },
      { emoji: '🧴', icon: SkincareIcon, label: 'skincare', href: '/search?dept=mocas&cat=beleza&sub=skincare' },
      { emoji: '🌸', icon: PerfumeIcon, label: 'perfumes', href: '/search?dept=mocas&cat=beleza&sub=perfumes' },
      { emoji: '💇‍♀️', icon: CabeloIcon, label: 'cabelos', href: '/search?dept=mocas&cat=beleza&sub=cabelos' },
      { emoji: '💅', icon: UnhaIcon, label: 'unhas', href: '/search?dept=mocas&cat=beleza&sub=unhas' },
    ],
  },
  {
    title: 'bolsas',
    subtitle: 'para carregar com estilo',
    href: '/search?dept=mocas&cat=bolsas',
    cards: [
      { emoji: '👜', icon: BolsaIcon, label: 'de ombro', href: '/search?dept=mocas&cat=bolsas&sub=ombro' },
      { emoji: '🎒', icon: MochilaIcon, label: 'mochilas', href: '/search?dept=mocas&cat=bolsas&sub=mochilas' },
      { emoji: '👛', icon: ClutchIcon, label: 'clutch', href: '/search?dept=mocas&cat=bolsas&sub=clutch' },
      { emoji: '🛍️', icon: ToteIcon, label: 'tote', href: '/search?dept=mocas&cat=bolsas&sub=tote' },
      { emoji: '💼', icon: CrossbodyIcon, label: 'crossbody', href: '/search?dept=mocas&cat=bolsas&sub=crossbody' },
    ],
  },
  {
    title: 'calçados',
    subtitle: 'da sapatilha ao salto',
    href: '/search?dept=mocas&cat=calcados',
    cards: [
      { emoji: '👟', icon: TenisIcon, label: 'tênis', href: '/search?dept=mocas&cat=calcados&sub=tenis' },
      { emoji: '👢', icon: BotaIcon, label: 'botas', href: '/search?dept=mocas&cat=calcados&sub=botas' },
      { emoji: '👡', icon: SandaliaIcon, label: 'sandálias', href: '/search?dept=mocas&cat=calcados&sub=sandalias' },
      { emoji: '👠', icon: SapatoSocialIcon, label: 'sapatos', href: '/search?dept=mocas&cat=calcados&sub=sapatos' },
      { emoji: '🥿', icon: MuleIcon, label: 'mules', href: '/search?dept=mocas&cat=calcados&sub=mules' },
    ],
  },
  {
    title: 'acessórios',
    subtitle: 'detalhes que fazem diferença',
    href: '/search?dept=mocas&cat=acessorios',
    cards: [
      { emoji: '👓', icon: OculosIcon, label: 'óculos', href: '/search?dept=mocas&cat=acessorios&sub=oculos' },
      { emoji: '⌚', icon: RelogioIcon, label: 'relógios', href: '/search?dept=mocas&cat=acessorios&sub=relogios' },
      { emoji: '💍', icon: JoiaIcon, label: 'jóias', href: '/search?dept=mocas&cat=acessorios&sub=joias-e-bijuterias' },
      { emoji: '🧣', icon: CachecolIcon, label: 'cachecóis', href: '/search?dept=mocas&cat=acessorios&sub=cachacois' },
      { emoji: '🎩', icon: ChapeuIcon, label: 'chapéus', href: '/search?dept=mocas&cat=acessorios&sub=chapeus' },
    ],
  },
]

export default function MocasPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] pb-24">
      <div className="px-5 pt-8 pb-6 border-b border-gray-100 dark:border-white/5">
        <p className="text-[11px] font-bold text-[var(--color-teal)] uppercase tracking-widest mb-2">departamento</p>
        <h1 className="text-[42px] font-black text-[var(--foreground)] leading-none mb-2">Feminino</h1>
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
            <CategoryScrollRow cards={section.cards.map(renderCard)} />
          </section>
        ))}
      </div>
    </div>
  )
}