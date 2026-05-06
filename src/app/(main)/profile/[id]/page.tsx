import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ProfileStoreClient } from "@/components/profile/ProfileStoreClient"
import { ListingStatus, ListingCondition } from "@prisma/client"

interface ProfilePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function ProfilePage({ params, searchParams }: ProfilePageProps) {
  const { id } = await params
  const sp = await searchParams
  const session = await auth()
  const isOwn = session?.user?.id === id

  // ── Filtros e Ordenação da URL ──
  const sort = sp.sort ?? 'popular'
  const condition = sp.condition as ListingCondition | undefined
  const minPriceCents = sp.minPrice ? Math.round(parseFloat(sp.minPrice) * 100) : undefined
  const maxPriceCents = sp.maxPrice ? Math.round(parseFloat(sp.maxPrice) * 100) : undefined
  const brand = sp.brand
  const size = sp.size
  const categoryName = sp.category

  const orderBy =
    sort === 'price_asc' || sort === 'discount' ? { priceCents: 'asc' as const } :
    sort === 'price_desc' ? { priceCents: 'desc' as const } :
    sort === 'recent' ? { createdAt: 'desc' as const } :
    { viewsCount: 'desc' as const }

  // ── Busca das Facetas (Marcas, Condições, Tamanhos e Categorias) ──
  const [brandGroups, conditionFacets, sizeGroups, categoryGroups] = await Promise.all([
    db.listing.groupBy({ by: ['brand'], where: { sellerId: id, status: ListingStatus.ACTIVE, brand: { not: null } }, _count: { brand: true } }),
    db.listing.groupBy({ by: ['condition'], where: { sellerId: id, status: ListingStatus.ACTIVE }, _count: { condition: true } }),
    db.listing.groupBy({ by: ['size'], where: { sellerId: id, status: ListingStatus.ACTIVE, size: { not: null } }, _count: { size: true } }),
    db.listing.findMany({ where: { sellerId: id, status: ListingStatus.ACTIVE }, select: { category: { select: { name: true } } }, distinct: ['categoryId'] })
  ])
  
  const storeBrands = brandGroups.map(g => g.brand).filter((b): b is string => !!b)
  const storeConditions = conditionFacets.map(f => f.condition)
  const storeSizes = sizeGroups.map(g => g.size).filter((s): s is string => !!s)
  const storeCategories = categoryGroups.map(c => c.category?.name).filter((c): c is string => !!c)

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      bio: true,
      avatarUrl: true,
      coverUrl: true,
      createdAt: true,
      
      // 👇 ADICIONE ISSO AQUI: Busca o endereço padrão
      addresses: {
        where: { isDefault: true },
        select: { city: true, state: true },
        take: 1
      },
      
      reviewsReceived: { 
        select: { 
          id: true,
          rating: true,
          comment: true,
          tags: true,
          createdAt: true,
          reviewer: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      },
      
      subscription: { include: { plan: true } },
      _count: { select: { listings: { where: { status: ListingStatus.SOLD } }, followers: true } },
      listings: {
        where: { 
          status: ListingStatus.ACTIVE,
          ...(condition && { condition }),
          ...(brand && { brand: { equals: brand, mode: 'insensitive' as const } }),
          ...(size && { size: { equals: size, mode: 'insensitive' as const } }),
          ...(categoryName && { category: { name: { equals: categoryName, mode: 'insensitive' as const } } }),
          ...((minPriceCents !== undefined || maxPriceCents !== undefined) && {
            priceCents: {
              ...(minPriceCents !== undefined && { gte: minPriceCents }),
              ...(maxPriceCents !== undefined && { lte: maxPriceCents }),
            },
          }),
        },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { displayOrder: "asc" }, take: 1, select: { url: true, altText: true } },
          seller: { select: { id: true, name: true, avatarUrl: true, addresses: { where: { isDefault: true }, select: { city: true, state: true }, take: 1 } } },
          _count: { select: { favorites: true } },
        },
        orderBy,
        take: 40,
      },
    },
  })

  if (!user) notFound()

  const totalRatings = user.reviewsReceived.length
  const avgRating = totalRatings > 0 ? (user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / totalRatings).toFixed(1) : null
  const activeSubscription = user.subscription?.status === 'ACTIVE' ? user.subscription : null
  const planName = activeSubscription?.plan?.name || "Kloop Basic"
  
  let planVariant: "basic" | "pro" | "premium" | "enterprise" = "basic"
  if (planName.toLowerCase().includes("pro")) planVariant = "pro"
  if (planName.toLowerCase().includes("premium")) planVariant = "premium"
  
  let maxMegaphones = 5 
  if (planVariant === "pro") maxMegaphones = 10
  if (planVariant === "premium") maxMegaphones = 25

  const userLocation = user.addresses[0] ?? null

  const initialIsFollowing = !isOwn && !!session?.user?.id
    ? !!(await db.follow.findUnique({
        where: { followerId_followingId: { followerId: session.user.id!, followingId: id } },
        select: { id: true },
      }))
    : false

  return (
    <ProfileStoreClient
       user={{ id: user.id, name: user.name, bio: user.bio, avatarUrl: user.avatarUrl, coverUrl: user.coverUrl, createdAt: user.createdAt }}
       isOwn={isOwn}
       listings={user.listings}
       reviews={user.reviewsReceived}
       avgRating={avgRating}
       totalRatings={totalRatings}
       planName={planName}
       planVariant={planVariant}
       megaphonesAvailable={Math.max(0, maxMegaphones - 0)}
       itemsSold={user._count.listings}
       followersCount={user._count.followers}
       initialIsFollowing={initialIsFollowing}
       storeBrands={storeBrands}
       storeConditions={storeConditions}
       storeSizes={storeSizes}
       storeCategories={storeCategories}
       currentParams={sp}
       userLocation={userLocation}
    />
  )
}