"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Eye, Heart, Handshake, Store, Tag, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ListingCard } from '@/components/listing/ListingCard'
import type { ListingWithDetails } from '@/types/listing'

type Tab = 'watching' | 'liked' | 'offers' | 'shops' | 'brands'

type Props = {
  watched: ListingWithDetails[]
  favorites: ListingWithDetails[]
  favoriteIds: string[]
}

type TabConfig = {
  id: Tab
  label: string
  Icon: LucideIcon
}

const TABS: TabConfig[] = [
  { id: 'watching', label: 'tô de olho', Icon: Eye },
  { id: 'liked',    label: 'yeyezados',  Icon: Heart },
  { id: 'offers',   label: 'ofertados',  Icon: Handshake },
  { id: 'shops',    label: 'lojinhas',   Icon: Store },
  { id: 'brands',   label: 'marcas',     Icon: Tag },
]

type EmptyStateProps = {
  emoji: string
  title: string
  description: string
  cta: string
  href: string
}

function EmptyState({ emoji, title, description, cta, href }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">
      <span className="text-7xl select-none">{emoji}</span>
      <div className="space-y-2">
        <h3 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">{title}</h3>
        <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed max-w-[280px]">{description}</p>
      </div>
      <Link
        href={href}
        className="border-2 border-[var(--color-pine)] dark:border-[var(--color-teal)] text-[var(--color-pine)] dark:text-[var(--color-teal)] px-8 py-3 rounded-full font-bold text-[14px] hover:bg-[var(--color-pine)]/5 dark:hover:bg-[var(--color-teal)]/5 transition-colors"
      >
        {cta}
      </Link>
    </div>
  )
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0",
        on ? "bg-[var(--color-teal)]" : "bg-gray-300 dark:bg-white/20"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
          on ? "translate-x-6" : "translate-x-0"
        )}
      />
    </button>
  )
}

export function MeuKloopClient({ watched, favorites, favoriteIds }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('watching')
  const [onlyAvailable, setOnlyAvailable] = useState(true)

  const favoriteSet = new Set(favoriteIds)

  return (
    <div className="min-h-screen bg-[var(--background)] pb-32">
      {/* ── Tab Bar ── */}
      <div className="sticky top-0 z-20 bg-[var(--background)] border-b border-gray-100 dark:border-white/5">
        <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {TABS.map(({ id, label, Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1.5 px-5 pt-3 pb-2.5 transition-colors border-b-2 whitespace-nowrap",
                  isActive
                    ? "text-[var(--color-pine)] dark:text-[var(--color-teal)] border-[var(--color-pine)] dark:border-[var(--color-teal)]"
                    : "text-gray-400 dark:text-sage/60 border-transparent hover:text-gray-600 dark:hover:text-sage"
                )}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? "fill-[var(--color-pine)]/10 dark:fill-[var(--color-teal)]/10" : ""}
                />
                <span className={cn("text-[10px] leading-none", isActive ? "font-bold" : "font-normal")}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="px-4 pt-5">

        {/* tô de olho */}
        {activeTab === 'watching' && (
          watched.length === 0 ? (
            <EmptyState
              emoji="👁️"
              title="ainda nada por aqui"
              description="os produtos que você visitar aparecerão aqui. que tal dar uma olhadinha?"
              cta="explorar produtos"
              href="/search"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              {watched.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isFavorited={favoriteSet.has(listing.id)}
                  minimal
                />
              ))}
            </div>
          )
        )}

        {/* yeyezados */}
        {activeTab === 'liked' && (
          <div>
            <div className="flex items-center justify-between mb-4 px-0.5">
              <span className="text-[14px] font-bold text-[var(--foreground)]">somente disponíveis</span>
              <Toggle on={onlyAvailable} onToggle={() => setOnlyAvailable((v) => !v)} />
            </div>

            {favorites.length === 0 ? (
              <EmptyState
                emoji="🤍"
                title="sem yeyezados ainda"
                description="deu o coração em alguma peça? ela aparece aqui."
                cta="explorar produtos"
                href="/search"
              />
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {favorites.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isFavorited={true}
                    minimal
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ofertados */}
        {activeTab === 'offers' && (
          <EmptyState
            emoji="🤝"
            title="tão bom negociar um negocinho"
            description="o preço do produto não convenceu? faça uma oferta e cruze os dedos."
            cta="explorar produtos"
            href="/search"
          />
        )}

        {/* lojinhas */}
        {activeTab === 'shops' && (
          <EmptyState
            emoji="🏪"
            title="siga suas lojinhas favoritas"
            description="o kloop tá cheio de lojinhas maneiras. siga suas favoritas e fique de olho nas novidades."
            cta="explorar por aí"
            href="/search"
          />
        )}

        {/* marcas */}
        {activeTab === 'brands' && (
          <EmptyState
            emoji="🏷️"
            title="siga suas marcas do coração"
            description="curte muito uma marca? siga suas favoritas e fique de olho nas novidades."
            cta="explorar por aí"
            href="/search"
          />
        )}

      </div>
    </div>
  )
}
