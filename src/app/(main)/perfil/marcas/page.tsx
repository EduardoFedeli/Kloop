import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { MarcasClient } from '@/components/perfil/MarcasClient'
import type { ListingWithDetails } from '@/types/listing'

export const dynamic = 'force-dynamic'

const LISTING_SELECT = {
  category: { select: { id: true, name: true, slug: true } },
  images: {
    orderBy: { displayOrder: 'asc' as const },
    take: 1,
    select: { url: true, altText: true },
  },
  seller: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      addresses: {
        where: { isDefault: true },
        select: { city: true, state: true },
        take: 1,
      },
    },
  },
} as const

export default async function MarcasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const userId = session.user.id

  const [brandFollowRows, favoriteRows] = await Promise.all([
    db.brandFollow.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      select: { brand: true },
    }),
    db.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    }),
  ])

  const followedBrands = brandFollowRows.map((r) => r.brand)
  const favoriteIds = favoriteRows.map((f) => f.listingId)

  if (followedBrands.length === 0) {
    return (
      <MarcasClient followedBrands={[]} brandFeeds={[]} favoriteIds={favoriteIds} />
    )
  }

  const listingsPerBrand = await Promise.all(
    followedBrands.map((brand) =>
      db.listing.findMany({
        where: { brand, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: LISTING_SELECT,
      })
    )
  )

  const brandFeeds = followedBrands.map((brand, i) => ({
    brand,
    listings: listingsPerBrand[i] as unknown as ListingWithDetails[],
  }))

  return (
    <MarcasClient
      followedBrands={followedBrands}
      brandFeeds={brandFeeds}
      favoriteIds={favoriteIds}
    />
  )
}
