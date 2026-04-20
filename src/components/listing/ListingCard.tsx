// Card de produto exibido no feed e nas buscas — clicável, com favorito e badge.
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
}

export function ListingCard({ listing, isFavorited, minimal = false }: Props) {
  const image = listing.images[0]
  const location = listing.seller.addresses[0]

  // ── Versão Minimalista (Estilo Enjoei Mobile para a Home) ──
  if (minimal) {
    return (
      <article className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 dark:bg-[var(--color-forest)]">
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
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
              📦
            </div>
          )}
        </Link>

        {/* Botão de favoritar — top right */}
        <FavoriteButton listingId={listing.id} initialFavorited={isFavorited} />

        {/* Tag flutuante de preço — bottom left */}
        <Link href={`/listing/${listing.slug}`} className="absolute bottom-2 left-2 z-10 block">
          <span className="font-bold text-[13px] px-2 py-1 rounded bg-white/95 dark:bg-[var(--color-pine)]/95 backdrop-blur-sm text-[var(--foreground)] shadow-sm">
            {formatPrice(listing.priceCents)}
          </span>
        </Link>
      </article>
    )
  }

  // ── Versão Padrão (Feed Completo e Buscas) ──
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
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            📦
          </div>
        )}

        <FavoriteButton listingId={listing.id} initialFavorited={isFavorited} />

        <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/85 backdrop-blur-sm text-gray-700">
          {conditionLabel[listing.condition]}
        </span>
      </Link>

      <Link href={`/listing/${listing.slug}`} className="block pt-2 pb-3 px-0.5 space-y-0.5">
        <p className="text-sm font-bold text-[var(--foreground)] leading-snug">
          {formatPrice(listing.priceCents)}
        </p>
        <p className="text-xs text-gray-600 dark:text-sage line-clamp-2 leading-snug">
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
    </article>
  )
}