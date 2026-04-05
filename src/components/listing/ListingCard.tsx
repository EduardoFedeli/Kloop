import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin } from 'lucide-react'
import { ListingCondition } from '@prisma/client'
import { cn, formatPrice } from '@/lib/utils'
import type { ListingWithDetails } from '@/types/listing'

const conditionLabel: Record<ListingCondition, string> = {
  NEW: 'Novo',
  LIKE_NEW: 'Seminovo',
  GOOD: 'Bom estado',
  FAIR: 'Usado',
}

const conditionColor: Record<ListingCondition, string> = {
  NEW: 'bg-celadon text-airforce',
  LIKE_NEW: 'bg-teal text-linen',
  GOOD: 'bg-teal-muted text-linen',
  FAIR: 'bg-teal-muted/60 text-airforce',
}

type Props = {
  listing: ListingWithDetails
}

export function ListingCard({ listing }: Props) {
  const image = listing.images[0]
  const location = listing.seller.addresses[0]

  return (
    <article className="bg-white rounded-2xl overflow-hidden border border-teal-muted/20 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/listing/${listing.slug}`} className="block relative aspect-square">
        <Image
          src={
            image?.url ?? 'https://placehold.co/400x400/69A297/F1F1E6?text=Sem+foto'
          }
          alt={image?.altText ?? listing.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <span
          className={cn(
            'absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full',
            conditionColor[listing.condition]
          )}
        >
          {conditionLabel[listing.condition]}
        </span>
        <button
          type="button"
          aria-label="Favoritar"
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-teal-muted hover:text-teal transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          <Heart size={16} />
        </button>
      </Link>

      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
          {listing.title}
        </h3>
        <p className="text-base font-bold text-airforce">{formatPrice(listing.priceCents)}</p>
        {location && (
          <div className="flex items-center gap-1 text-[11px] text-teal-muted">
            <MapPin size={11} />
            <span>
              {location.city}, {location.state}
            </span>
          </div>
        )}
      </div>
    </article>
  )
}
