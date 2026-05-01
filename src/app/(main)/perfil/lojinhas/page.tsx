import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { LojinhasClient } from '@/components/perfil/LojinhasClient'
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

export default async function LojinhasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const userId = session.user.id

  const [follows, favoriteRows] = await Promise.all([
    db.follow.findMany({
      where: { followerId: userId },
      include: { following: { select: { id: true, name: true, avatarUrl: true } } },
    }),
    db.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    }),
  ])

  const followedSellers = follows.map((f) => f.following)
  const followingIds = followedSellers.map((s) => s.id)
  const favoriteIds = favoriteRows.map((f) => f.listingId)

  const feedLojinhasRows = followingIds.length > 0
    ? await db.listing.findMany({
        where: { sellerId: { in: followingIds }, status: 'ACTIVE' },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: LISTING_SELECT,
      })
    : []

  const feedLojinhas = feedLojinhasRows as unknown as ListingWithDetails[]

  return (
    <LojinhasClient
      followedSellers={followedSellers}
      feedLojinhas={feedLojinhas}
      favoriteIds={favoriteIds}
    />
  )
}
