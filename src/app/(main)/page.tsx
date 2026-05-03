export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { HomeFeed } from '@/components/listing/HomeFeed'
import type { ListingWithDetails, CategoryOption } from '@/types/listing'

export type SellerPreview = {
  id: string
  name: string | null
  avatarUrl: string | null
  listingCount: number
}

export default async function FeedPage() {
  const session = await auth()
  const selfId = session?.user?.id

  const [rawListings, categories, rawSellers] = await Promise.all([
    db.listing.findMany({
      where: {
        status: 'ACTIVE',
        ...(selfId && { NOT: { sellerId: selfId } }),
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: {
          orderBy: { displayOrder: 'asc' },
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
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
    db.user.findMany({
      where: { listings: { some: { status: 'ACTIVE' } } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        _count: { select: { listings: { where: { status: 'ACTIVE' } } } },
      },
      orderBy: { listings: { _count: 'desc' } },
      take: 8,
    }),
  ])

  const listings: ListingWithDetails[] = rawListings
  const categoryOptions: CategoryOption[] = categories
  const sellers: SellerPreview[] = rawSellers.map((s) => ({
    id: s.id,
    name: s.name,
    avatarUrl: s.avatarUrl,
    listingCount: s._count.listings,
  }))

  const favoriteIds = selfId
    ? await db.favorite
        .findMany({
          where: { userId: selfId },
          select: { listingId: true },
        })
        .then((favs) => favs.map((f) => f.listingId))
    : []

  return (
    <HomeFeed
      listings={listings}
      categories={categoryOptions}
      favoriteIds={favoriteIds}
      sellers={sellers}
    />
  )
}
