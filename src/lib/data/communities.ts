import { db } from "@/lib/db"

export type UserCommunity = {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  memberSince: Date
  unitNumber: string | null
  memberCount: number
}

export type CommunityWithMembership = {
  id: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  memberCount: number
  isMember: boolean
}

export async function getUserCommunities(userId: string): Promise<UserCommunity[]> {
  const memberships = await db.communityMember.findMany({
    where: { userId, status: "ACTIVE" },
    include: {
      community: {
        include: {
          _count: { select: { members: { where: { status: "ACTIVE" } } } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  })

  return memberships
    .filter((m) => m.community.isActive)
    .map((m) => ({
      id: m.community.id,
      name: m.community.name,
      slug: m.community.slug,
      description: m.community.description,
      logoUrl: m.community.logoUrl,
      memberSince: m.joinedAt,
      unitNumber: m.unitNumber,
      memberCount: m.community._count.members,
    }))
}

export async function getUserCommunitiesCount(userId: string): Promise<number> {
  return db.communityMember.count({
    where: { userId, status: "ACTIVE", community: { isActive: true } },
  })
}

export async function getCommunityBySlug(
  slug: string,
  userId?: string,
): Promise<CommunityWithMembership | null> {
  const community = await db.community.findUnique({
    where: { slug, isActive: true },
    include: {
      _count: { select: { members: { where: { status: "ACTIVE" } } } },
    },
  })

  if (!community) return null

  let isMember = false
  if (userId) {
    const membership = await db.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId } },
      select: { status: true },
    })
    isMember = membership?.status === "ACTIVE"
  }

  return {
    id: community.id,
    name: community.name,
    slug: community.slug,
    description: community.description,
    logoUrl: community.logoUrl,
    memberCount: community._count.members,
    isMember,
  }
}

export type CommunityListing = {
  id: string
  title: string
  slug: string
  priceCents: number
  condition: string
  images: { url: string; altText: string | null }[]
  seller: {
    id: string
    name: string | null
    avatarUrl: string | null
    addresses: { city: string; state: string }[]
  }
  brand: { id: string; name: string; slug: string } | null
  size: string | null
  isTurbinado: boolean
  _count: { favorites: number; listingCommunities: number }
  status: string
  category: { id: string; name: string; slug: string }
  viewsCount: number
}

export async function getCommunityListings(
  communityId: string,
  opts: { take?: number; skip?: number } = {},
): Promise<CommunityListing[]> {
  const { take = 20, skip = 0 } = opts

  const rows = await db.listingCommunity.findMany({
    where: { communityId, listing: { status: "ACTIVE" } },
    orderBy: { createdAt: "desc" },
    take,
    skip,
    include: {
      listing: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { displayOrder: "asc" }, take: 1, select: { url: true, altText: true } },
          seller: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              addresses: { where: { isDefault: true }, select: { city: true, state: true }, take: 1 },
            },
          },
          brand: { select: { id: true, name: true, slug: true } },
          _count: { select: { favorites: true, listingCommunities: true } },
        },
      },
    },
  })

  return rows.map((r) => ({
    id: r.listing.id,
    title: r.listing.title,
    slug: r.listing.slug,
    priceCents: r.listing.priceCents,
    condition: r.listing.condition,
    images: r.listing.images,
    seller: r.listing.seller,
    brand: r.listing.brand,
    size: r.listing.size,
    isTurbinado: r.listing.isTurbinado,
    _count: r.listing._count,
    status: r.listing.status,
    category: r.listing.category,
    viewsCount: r.listing.viewsCount,
  }))
}

export async function getListingCommunityIds(listingId: string): Promise<string[]> {
  const rows = await db.listingCommunity.findMany({
    where: { listingId },
    select: { communityId: true },
  })
  return rows.map((r) => r.communityId)
}
