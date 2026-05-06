import Link from 'next/link'
import { ListingCondition } from '@prisma/client'
import { formatPrice } from '@/lib/utils'
import type { ListingWithDetails } from '@/types/listing'
import { FavoriteButton } from './FavoriteButton'

const conditionLabel: Record<ListingCondition, string> = {
  NEW: 'novo',
  LIKE_NEW: 'seminovo',
  GOOD: 'bom estado',
  FAIR: 'usado',
}

type Props = {
  listing: ListingWithDetails
  isFavorited: boolean
  minimal?: boolean
  variant?: 'default' | 'search' 
  showSeller?: boolean
  hideFavorite?: boolean // 1. Aqui nós declaramos que essa prop existe
}

export function ListingCard({ 
  listing, 
  isFavorited, 
  minimal = false, 
  variant = 'default',
  showSeller = false,
  hideFavorite = false // 2. Aqui dizemos que o padrão dela é "false" (não esconder)
}: Props) {
  const image = listing.images[0]
  const location = listing.seller.addresses[0]
  
  const firstName = listing.seller.name?.split(' ')[0].toLowerCase() || 'vendedor'
  const initials = listing.seller.name?.substring(0, 2).toUpperCase() || 'KL'

  const hasDiscount = true; 
  const discountPercent = 15; 
  const originalPriceCents = listing.priceCents * 1.15; 

  // ── 1. VERSÃO BUSCA (Foco em conversão rápida, estilo Enjoei) ──
  if (variant === 'search') {
    const likesCount = listing._count?.favorites ?? 0
    return (
      <article className="group flex flex-col">
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-[var(--color-forest)] mb-2">
          <Link href={`/listing/${listing.slug}`} className="block w-full h-full">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt={image.altText ?? listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
            )}
          </Link>

          {hasDiscount && (
            <div className="absolute bottom-1.5 left-1.5 bg-[var(--color-celadon)] text-[var(--color-pine)] text-[11px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
              {discountPercent}%
            </div>
          )}

          {!hideFavorite && (
            <FavoriteButton
              listingId={listing.id}
              initialFavorited={isFavorited}
              showCount
              count={likesCount}
            />
          )}
        </div>

        <Link href={`/listing/${listing.slug}`} className="block px-1 flex-1 flex flex-col">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-extrabold text-[15px] text-[var(--foreground)]">
              {formatPrice(listing.priceCents)}
            </span>
            {hasDiscount && (
              <span className="text-[11px] font-medium text-gray-400 line-through">
                {formatPrice(originalPriceCents)}
              </span>
            )}
          </div>

          <p className="text-[13px] font-medium text-gray-600 dark:text-sage/80 line-clamp-1 leading-snug">
            {listing.title.toLowerCase()}
          </p>

          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            {listing.brand && (
              <p className="text-[12px] font-bold text-[var(--color-teal)] dark:text-[var(--color-celadon)]">
                {listing.brand.toLowerCase()}
              </p>
            )}
            {listing.brand && listing.size && (
              <span className="text-[12px] text-gray-300 dark:text-white/20">·</span>
            )}
            {listing.size && (
              <p className="text-[12px] font-bold text-gray-400 dark:text-sage/70">
                {listing.size.toUpperCase()}
              </p>
            )}
          </div>
        </Link>
      </article>
    )
  }

  // ── 2. VERSÃO MINIMALISTA (Para a Home e Lojinhas) ──
  if (minimal) {
    return (
      <article className="group flex flex-col gap-2">
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-[var(--color-forest)]">
          <Link href={`/listing/${listing.slug}`} className="block w-full h-full">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.url}
                alt={image.altText ?? listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
            )}
          </Link>

          <Link href={`/listing/${listing.slug}`} className="absolute bottom-2 left-2 z-10 block">
            <span className="font-bold text-[13px] px-2 py-1 rounded bg-white/95 dark:bg-[var(--color-pine)]/95 backdrop-blur-sm text-[var(--foreground)] shadow-sm">
              {formatPrice(listing.priceCents)}
            </span>
          </Link>
        </div>

        {showSeller && listing.seller && (
          <Link href={`/profile/${listing.seller.id}`} className="flex items-center gap-2 px-1 hover:opacity-80 transition-opacity">
            {listing.seller.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={listing.seller.avatarUrl} alt={firstName} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[var(--color-teal)] dark:bg-[var(--color-celadon)] flex items-center justify-center text-[8px] text-white dark:text-[var(--color-pine)] font-bold">
                {initials}
              </div>
            )}
            <span className="text-[11px] font-bold truncate text-gray-600 dark:text-sage">
              {firstName}
            </span>
          </Link>
        )}
      </article>
    )
  }

  // ── 3. VERSÃO PADRÃO (Feed Completo detalhado) ──
  return (
    <article className="group">
      <Link href={`/listing/${listing.slug}`} className="block relative aspect-square rounded-xl overflow-hidden bg-gray-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={image.altText ?? listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">📦</div>
        )}

        {/* Bloqueio na versão padrão */}
        {!hideFavorite && (
          <FavoriteButton listingId={listing.id} initialFavorited={isFavorited} />
        )}

        <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-sm text-gray-700">
          {conditionLabel[listing.condition]}
        </span>
      </Link>

      <div className="pt-2 pb-3 px-0.5 space-y-0.5">
        <Link href={`/listing/${listing.slug}`} className="block">
          <p className="text-sm font-bold text-[var(--foreground)] leading-snug">
            {formatPrice(listing.priceCents)}
          </p>
          <p className="text-xs text-gray-600 dark:text-sage line-clamp-2 leading-snug mt-0.5">
            {listing.title}
          </p>
          {listing.brand && (
            <p className="text-[11px] text-gray-400 dark:text-sage/70">
              {listing.brand}
            </p>
          )}
          {location && (
            <p className="text-[10px] text-gray-300 dark:text-sage/50">
              {location.city}, {location.state}
            </p>
          )}
        </Link>

        {showSeller && listing.seller && (
          <div className="pt-2 mt-1 border-t border-gray-100 dark:border-white/5">
            <Link href={`/profile/${listing.seller.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {listing.seller.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={listing.seller.avatarUrl} alt={firstName} className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[var(--color-teal)] dark:bg-[var(--color-celadon)] flex items-center justify-center text-[8px] text-white dark:text-[var(--color-pine)] font-bold">
                  {initials}
                </div>
              )}
              <span className="text-[11px] font-bold truncate text-gray-500 dark:text-sage">
                {firstName}
              </span>
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}