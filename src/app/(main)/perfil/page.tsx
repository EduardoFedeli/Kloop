import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { MeuKloopClient } from '@/components/perfil/MeuKloopClient'
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

export default async function MeuKloopPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const userId = session.user.id

  const [favoriteRows, recentListings] = await Promise.all([
    db.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        listing: {
          include: LISTING_SELECT,
        },
      },
    }),
    // Mostra listings recentes como proxy de "vistos" enquanto não há tabela de histórico
    db.listing.findMany({
      where: { status: 'ACTIVE', NOT: { sellerId: userId } },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: LISTING_SELECT,
    }),
  ])

  const favorites: ListingWithDetails[] = favoriteRows.map((f) => f.listing as unknown as ListingWithDetails)
  const watched: ListingWithDetails[] = recentListings as unknown as ListingWithDetails[]
  const favoriteIds: string[] = favoriteRows.map((f) => f.listingId)

  return (
    <MeuKloopClient
      watched={watched}
      favorites={favorites}
      favoriteIds={favoriteIds}
    />
  )
}
