import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { FavoritosClient } from '@/components/perfil/FavoritosClient'
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

export default async function FavoritosPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const favoriteRows = await db.favorite.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { listing: { include: LISTING_SELECT } },
  })

  const favorites = favoriteRows.map((f) => f.listing) as unknown as ListingWithDetails[]
  const favoriteIds = favoriteRows.map((f) => f.listingId)

  return <FavoritosClient favorites={favorites} favoriteIds={favoriteIds} />
}
