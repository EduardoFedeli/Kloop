export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { SearchFilters } from '@/components/search/SearchFilters'
import { ListingGrid } from '@/components/listing/ListingGrid'
import type { ListingWithDetails } from '@/types/listing'
import type { Prisma, ListingCondition } from '@prisma/client'

type SearchParams = Promise<{
  q?: string
  category?: string
  condition?: string
  priceMin?: string
  priceMax?: string
  sort?: string
}>

const VALID_CONDITIONS: ListingCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']

function parseCondition(value: string | undefined): ListingCondition | undefined {
  if (!value) return undefined
  return VALID_CONDITIONS.includes(value as ListingCondition)
    ? (value as ListingCondition)
    : undefined
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams

  const q = params.q?.trim() || undefined
  const validCondition = parseCondition(params.condition)

  const rawPriceMin = parseInt(params.priceMin ?? '', 10)
  const rawPriceMax = parseInt(params.priceMax ?? '', 10)
  const priceMin = !isNaN(rawPriceMin) && rawPriceMin > 0 ? rawPriceMin : undefined
  const priceMax = !isNaN(rawPriceMax) && rawPriceMax > 0 ? rawPriceMax : undefined

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    params.sort === 'price_asc'
      ? { priceCents: 'asc' }
      : params.sort === 'price_desc'
      ? { priceCents: 'desc' }
      : { createdAt: 'desc' }

  const [categories, categoryRecord, rawListings, session] = await Promise.all([
    db.category.findMany({ orderBy: { name: 'asc' } }),
    params.category
      ? db.category.findUnique({ where: { slug: params.category } })
      : Promise.resolve(null),
    db.listing.findMany({
      where: buildWhere({ q, categorySlug: params.category, validCondition, priceMin, priceMax }),
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: {
          select: { url: true, altText: true },
          orderBy: { displayOrder: 'asc' },
          take: 1,
        },
        seller: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            addresses: {
              select: { city: true, state: true },
              where: { isDefault: true },
              take: 1,
            },
          },
        },
      },
      orderBy,
    }),
    auth(),
  ])

  // categoryRecord is resolved before we build where, but we pass category slug and resolve
  // within the where builder using the resolved id. Re-use categoryRecord here.
  void categoryRecord

  let favoriteIds: string[] = []
  if (session?.user?.id) {
    const favs = await db.favorite.findMany({
      where: { userId: session.user.id },
      select: { listingId: true },
    })
    favoriteIds = favs.map((f) => f.listingId)
  }

  const listings = rawListings as ListingWithDetails[]

  const hasFilters = !!(
    params.category ||
    params.condition ||
    params.priceMin ||
    params.priceMax ||
    params.sort
  )

  return (
    <div>
      {/* Page title / summary */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-airforce">
          {q ? `resultados para "${q}"` : 'todos os desapegos'}
        </h1>
        <p className="text-sm text-teal-muted mt-1">
          {listings.length}{' '}
          {listings.length === 1 ? 'desapego encontrado' : 'desapegos encontrados'}
        </p>
      </div>

      <div className="flex gap-6">
        {/* Desktop sidebar — SearchFilters renders its own <aside> for lg screens */}
        <div className="hidden lg:block shrink-0">
          <SearchFilters categories={categories} searchParams={params} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Mobile filter trigger */}
          <div className="lg:hidden mb-4">
            <SearchFilters categories={categories} searchParams={params} />
          </div>

          {/* Results */}
          {listings.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <p className="text-lg font-semibold text-airforce">Nenhum desapego encontrado</p>
              <p className="text-sm text-teal-muted">
                {q
                  ? `Tente outros termos além de "${q}"`
                  : 'Tente ajustar os filtros'}
              </p>
              {(q || hasFilters) && (
                <a
                  href="/search"
                  className="inline-flex items-center gap-2 bg-teal text-linen font-semibold px-6 py-2.5 rounded-full hover:bg-airforce transition-colors text-sm"
                >
                  limpar filtros
                </a>
              )}
            </div>
          ) : (
            <ListingGrid listings={listings} favoriteIds={favoriteIds} compact />
          )}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type WhereArgs = {
  q: string | undefined
  categorySlug: string | undefined
  validCondition: ListingCondition | undefined
  priceMin: number | undefined
  priceMax: number | undefined
}

function buildWhere({
  q,
  categorySlug,
  validCondition,
  priceMin,
  priceMax,
}: WhereArgs): Prisma.ListingWhereInput {
  const priceCents: Prisma.IntFilter | undefined =
    priceMin !== undefined && priceMax !== undefined
      ? { gte: priceMin, lte: priceMax }
      : priceMin !== undefined
      ? { gte: priceMin }
      : priceMax !== undefined
      ? { lte: priceMax }
      : undefined

  return {
    status: 'ACTIVE',
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { brand: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(validCondition ? { condition: validCondition } : {}),
    ...(priceCents ? { priceCents } : {}),
  }
}
