"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Tag, X } from 'lucide-react'
import { ListingCard } from '@/components/listing/ListingCard'
import { toggleFollow } from '@/app/actions/interacoes'
import { toast } from 'sonner'
import type { ListingWithDetails } from '@/types/listing'

type BrandFeed = {
  brand: string
  listings: ListingWithDetails[]
}

type Props = {
  followedBrands: string[]
  brandFeeds: BrandFeed[]
}

export function MarcasClient({ followedBrands, brandFeeds }: Props) {
  const [showFollowingList, setShowFollowingList] = useState(false)
  const [unfollowingBrand, setUnfollowingBrand] = useState<string | null>(null)

  const handleUnfollow = async (brand: string) => {
    setUnfollowingBrand(brand)
    try {
      await toggleFollow(brand, 'BRAND')
      toast.info(`Você deixou de seguir ${brand}.`)
      // Reload para atualizar o feed
      window.location.reload()
    } catch {
      toast.error('Erro ao deixar de seguir a marca.')
      setUnfollowingBrand(null)
    }
  }

  if (followedBrands.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5">
        <span className="text-7xl select-none">🏷️</span>
        <div className="space-y-2">
          <h3 className="text-[17px] font-black text-[var(--foreground)] tracking-tight">siga suas marcas do coração</h3>
          <p className="text-[13px] text-gray-500 dark:text-sage leading-relaxed max-w-[280px]">
            fique de olho nas novidades das suas marcas favoritas.
          </p>
        </div>
        <Link
          href="/buscar"
          className="border-2 border-[var(--color-pine)] dark:border-[var(--color-teal)] text-[var(--color-pine)] dark:text-[var(--color-teal)] px-8 py-3 rounded-full font-bold text-[14px] hover:bg-[var(--color-pine)]/5 dark:hover:bg-[var(--color-teal)]/5 transition-colors"
        >
          explorar por aí
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com botão "quem eu sigo" */}
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-black text-[var(--foreground)]">novidades das marcas</h2>
        <button
          onClick={() => setShowFollowingList((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] font-bold text-[var(--color-teal)] bg-[var(--color-teal)]/10 px-3 py-1.5 rounded-full"
        >
          <Tag size={14} /> marcas que sigo ({followedBrands.length})
        </button>
      </div>

      {/* Painel de marcas seguidas */}
      {showFollowingList && (
        <div className="bg-white dark:bg-[var(--color-pine)] border border-gray-100 dark:border-white/5 rounded-2xl p-4 shadow-sm animate-in slide-in-from-top-2">
          <h3 className="text-[13px] font-bold text-gray-500 dark:text-sage mb-3">você segue estas marcas:</h3>
          <div className="flex flex-wrap gap-2">
            {followedBrands.map((brand) => (
              <div
                key={brand}
                className="flex items-center gap-1.5 bg-[var(--color-teal)]/10 text-[var(--color-pine)] dark:text-[var(--color-celadon)] text-[12px] font-bold px-3 py-1.5 rounded-full"
              >
                <span>{brand}</span>
                <button
                  onClick={() => handleUnfollow(brand)}
                  disabled={unfollowingBrand === brand}
                  className="ml-0.5 text-gray-400 hover:text-red-400 transition disabled:opacity-50"
                  aria-label={`Deixar de seguir ${brand}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fileiras por marca */}
      {brandFeeds.map(({ brand, listings }) => (
        <section key={brand} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-black text-[var(--foreground)] flex items-center gap-2">
              <span className="text-[var(--color-teal)]">#</span>
              {brand.toLowerCase()}
            </h3>
            <Link
              href={`/buscar?brand=${encodeURIComponent(brand)}`}
              className="text-[12px] font-bold text-[var(--color-teal)] hover:underline"
            >
              ver tudo
            </Link>
          </div>

          {listings.length === 0 ? (
            <p className="text-[13px] text-gray-400 dark:text-sage py-4 text-center">
              nenhum produto ativo no momento.
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden -mx-4 px-4">
              {listings.map((listing) => (
                <div key={listing.id} className="flex-shrink-0 w-[160px]">
                  <ListingCard
                    listing={listing}
                    variant="search"
                    showSeller={false}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}