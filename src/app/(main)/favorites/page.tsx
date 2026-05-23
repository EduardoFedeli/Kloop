import { redirect } from 'next/navigation'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { ListingGrid } from '@/components/listing/ListingGrid'
import type { ListingWithDetails } from '@/types/listing'

export const dynamic = 'force-dynamic'

export default async function FavoritesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const favorites = await db.favorite.findMany({
    where: { userId: session.user.id },
    include: {
      listing: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: {
            select: { url: true, altText: true },
            orderBy: { displayOrder: 'asc' },
            take: 1,
          },
          seller: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              addresses: {
                select: { city: true, state: true },
                where: { isDefault: true },
                take: 1,
              },
            },
          },
          brand: { select: { id: true, name: true, slug: true } },
          _count: { select: { favorites: true, listingCommunities: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const listings: ListingWithDetails[] = favorites.map((f) => ({
    id: f.listing.id,
    title: f.listing.title,
    slug: f.listing.slug,
    priceCents: f.listing.priceCents,
    condition: f.listing.condition,
    status: f.listing.status,
    brand: f.listing.brand,
    size: f.listing.size,
    isTurbinado: f.listing.isTurbinado,
    viewsCount: f.listing.viewsCount,
    _count: f.listing._count,
    category: f.listing.category,
    images: f.listing.images,
    seller: f.listing.seller as ListingWithDetails['seller'],
  }))

  // On this page, all listed items ARE the user's favorites
  const favoriteIds = listings.map((l) => l.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-airforce">salvos</h1>
        <p className="text-sm text-teal-muted mt-1">
          {listings.length} {listings.length === 1 ? 'desapego salvo' : 'desapegos salvos'}
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <p className="text-4xl">🤍</p>
          <p className="text-lg font-semibold text-airforce">Você ainda não salvou nenhum desapego</p>
          <p className="text-sm text-teal-muted">Explore produtos e salve os que você curtir</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-teal text-linen font-bold px-6 py-3 rounded-full hover:bg-airforce transition-colors"
          >
            Explorar produtos
          </Link>
        </div>
      ) : (
        <ListingGrid listings={listings} favoriteIds={favoriteIds} />
      )}
    </div>
  )
}
