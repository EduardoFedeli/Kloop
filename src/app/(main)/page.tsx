export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { HomeFeed } from '@/components/listing/HomeFeed'
import type { ListingWithDetails, CategoryOption } from '@/types/listing'

export default async function FeedPage() {
  const [rawListings, categories] = await Promise.all([
    db.listing.findMany({
      where: { status: 'ACTIVE' },
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
  ])

  const listings: ListingWithDetails[] = rawListings
  const categoryOptions: CategoryOption[] = categories

  return <HomeFeed listings={listings} categories={categoryOptions} />
}
