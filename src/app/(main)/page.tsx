export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { HomeFeed } from '@/components/listing/HomeFeed'
import type { ListingWithDetails } from '@/types/listing'
import { getListingDiscount } from '@/lib/utils'

export type SellerPreview = {
  id: string
  name: string | null
  avatarUrl: string | null
  listingCount: number
}

export type CommunitySection = {
  communityName: string
  communitySlug: string
  listings: ListingWithDetails[]
}

export type BentoCard = {
  label: string
  href: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default async function FeedPage() {
  const session = await auth()
  const selfId = session?.user?.id

  const [rawListings, rawSellers] = await Promise.all([
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
        brand: { select: { id: true, name: true, slug: true } },
        _count: { select: { listingCommunities: true } },
      },
    }),
    db.user.findMany({
      where: { listings: { some: { status: 'ACTIVE' } } },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        _count: { select: { listings: { where: { status: 'ACTIVE' } } } },
      },
      take: 20,
    }),
  ])

  const listings: ListingWithDetails[] = shuffle(rawListings)

  const promoListings = listings
    .filter((l) => getListingDiscount(l.priceCents, l.createdAt!, l.acceptsDiscount ?? false) !== null)
    .slice(0, 8)
  const sellers: SellerPreview[] = shuffle(rawSellers).slice(0, 8).map((s) => ({
    id: s.id,
    name: s.name,
    avatarUrl: s.avatarUrl,
    listingCount: s._count.listings,
  }))

  let communitySection: CommunitySection | null = null
  let bentoCards: BentoCard[] = []

  if (selfId) {
    const [memberRecord, userRecord] = await Promise.all([
      db.communityMember.findFirst({
        where: { userId: selfId, status: 'ACTIVE' },
        include: {
          community: {
            select: {
              id: true,
              name: true,
              slug: true,
              listingCommunities: {
                where: { listing: { status: 'ACTIVE', NOT: { sellerId: selfId } } },
                include: {
                  listing: {
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
                      brand: { select: { id: true, name: true, slug: true } },
                      _count: { select: { listingCommunities: true } },
                    },
                  },
                },
                take: 20,
              },
            },
          },
        },
      }),
      db.user.findUnique({
        where: { id: selfId },
        select: { genderPreference: true },
      }),
    ])

    if (memberRecord?.community.listingCommunities.length) {
      communitySection = {
        communityName: memberRecord.community.name,
        communitySlug: memberRecord.community.slug,
        listings: shuffle(memberRecord.community.listingCommunities.map((lc) => lc.listing)).slice(0, 10) as ListingWithDetails[],
      }
    }

    const genderPreference = userRecord?.genderPreference ?? null

    if (genderPreference === 'FEMININE' || genderPreference === 'MASCULINE') {
      const deptKeyword = genderPreference === 'FEMININE' ? 'Moças' : 'Rapazes'
      const dept = await db.category.findFirst({
        where: { name: { contains: deptKeyword, mode: 'insensitive' }, parentId: null },
        select: { id: true, slug: true },
      })
      if (dept) {
        const children = await db.category.findMany({
          where: { parentId: dept.id },
          select: { name: true },
          take: 5,
          orderBy: { sortOrder: 'asc' },
        })
        bentoCards = children.map((c) => ({ label: c.name, href: `/search?dept=${dept.slug}&cat=${encodeURIComponent(c.name)}` }))
      }
    } else if (genderPreference === 'BOTH') {
      const [deptF, deptM] = await Promise.all([
        db.category.findFirst({ where: { name: { contains: 'Moças', mode: 'insensitive' }, parentId: null }, select: { id: true, slug: true } }),
        db.category.findFirst({ where: { name: { contains: 'Rapazes', mode: 'insensitive' }, parentId: null }, select: { id: true, slug: true } }),
      ])
      const [childrenF, childrenM] = await Promise.all([
        deptF ? db.category.findMany({ where: { parentId: deptF.id }, select: { name: true }, take: 3, orderBy: { sortOrder: 'asc' } }) : [],
        deptM ? db.category.findMany({ where: { parentId: deptM.id }, select: { name: true }, take: 2, orderBy: { sortOrder: 'asc' } }) : [],
      ])
      const cardsF = deptF ? childrenF.map((c) => ({ label: c.name, href: `/search?dept=${deptF.slug}&cat=${encodeURIComponent(c.name)}` })) : []
      const cardsM = deptM ? childrenM.map((c) => ({ label: c.name, href: `/search?dept=${deptM.slug}&cat=${encodeURIComponent(c.name)}` })) : []
      bentoCards = [...cardsF, ...cardsM]
    }
  }

  return (
    <HomeFeed
      listings={listings}
      sellers={sellers}
      communitySection={communitySection}
      bentoCards={bentoCards}
      promoListings={promoListings}
    />
  )
}
