import type { ListingWithDetails } from '@/types/listing'
import { ListingCard } from './ListingCard'

type Props = {
  listings: ListingWithDetails[]
}

export function ListingGrid({ listings }: Props) {
  if (listings.length === 0) {
    return (
      <div className="text-center py-16 text-teal-muted">
        <p className="text-base">Nenhum anúncio encontrado.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  )
}
