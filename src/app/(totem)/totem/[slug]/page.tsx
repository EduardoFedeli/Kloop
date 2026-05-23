import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { TotemFeed } from './TotemFeed'

export const dynamic = 'force-dynamic'

export default async function TotemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const community = await db.community.findUnique({
    where: { slug, isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      logoUrl: true,
      _count: { select: { members: { where: { status: 'ACTIVE' } } } },
    },
  })

  if (!community) notFound()

  const rawListings = await db.listing.findMany({
    where: {
      status: 'ACTIVE',
      listingCommunities: { some: { communityId: community.id } },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { displayOrder: 'asc' }, take: 1, select: { url: true, altText: true } },
      seller: {
        select: {
          id: true,
          name: true,
          communityMemberships: {
            where: { communityId: community.id, status: 'ACTIVE' },
            select: { unitNumber: true },
            take: 1,
          },
        },
      },
      brand: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const listings = rawListings.map((l) => ({
    id: l.id,
    title: l.title,
    slug: l.slug,
    priceCents: l.priceCents,
    condition: l.condition,
    size: l.size,
    brandName: l.brand?.name ?? null,
    categoryId: l.category.id,
    categoryName: l.category.name,
    categorySlug: l.category.slug,
    imageUrl: l.images[0]?.url ?? null,
    sellerName: l.seller.name,
    unitNumber: l.seller.communityMemberships[0]?.unitNumber ?? null,
  }))

  const categories = Array.from(
    new Map(
      listings.map((l) => [l.categoryId, { id: l.categoryId, name: l.categoryName, slug: l.categorySlug }])
    ).values()
  )

  return (
    <TotemFeed
      community={{
        id: community.id,
        name: community.name,
        slug: community.slug,
        description: community.description,
        logoUrl: community.logoUrl,
        memberCount: community._count.members,
      }}
      listings={listings}
      categories={categories}
    />
  )
}
