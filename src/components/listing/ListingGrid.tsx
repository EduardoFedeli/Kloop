import { cn } from '@/lib/utils'
import type { ListingWithDetails } from '@/types/listing'
import { ListingCard } from './ListingCard'

type Props = {
  listings: ListingWithDetails[]
  favoriteIds?: string[]
  compact?: boolean
}

export function ListingGrid({ listings, favoriteIds, compact }: Props) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16 text-teal-muted">
        <p className="text-base">Nenhum anúncio encontrado.</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid gap-3',
        compact
          ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      )}
    >
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          isFavorited={(favoriteIds ?? []).includes(listing.id)}
        />
      ))}
    </div>
  )
}
