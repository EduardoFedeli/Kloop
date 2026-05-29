import { cn } from '@/lib/utils'
import type { ListingWithDetails } from '@/types/listing'
import { ListingCard } from './ListingCard'

type Props = {
  listings: ListingWithDetails[]
  compact?: boolean
  minimal?: boolean
  variant?: 'default' | 'search'
  showCommunityBadges?: boolean
}

export function ListingGrid({
  listings,
  compact,
  minimal = false,
  variant = 'default',
  showCommunityBadges = false,
}: Props) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-sage">
        <p className="text-[15px] font-medium">Nenhum anúncio encontrado.</p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid gap-3 sm:gap-4',
        compact
          ? 'grid-cols-2 sm:grid-cols-3'
          : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      )}
    >
      {listings.map((listing) => {
        const hasCommunities =
          showCommunityBadges && (listing._count?.listingCommunities ?? 0) > 0
        return (
          <ListingCard
            key={listing.id}
            listing={listing}
            minimal={minimal}
            variant={variant}
            communityBadge={hasCommunities ? { type: 'generic' } : undefined}
          />
        )
      })}
    </div>
  )
}