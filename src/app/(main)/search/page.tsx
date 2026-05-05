export const dynamic = 'force-dynamic'

import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { ListingStatus, ListingCondition } from '@prisma/client'
import { SearchPageClient } from '@/components/search/SearchPageClient'
import { SearchVitrine } from '@/components/search/SearchVitrine'
import type { ListingWithDetails } from '@/types/listing'

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

// ── NOVA FUNÇÃO RECURSIVA: Busca TODOS os níveis descendentes ──
async function getAllDescendantIds(parentId: string): Promise<string[]> {
  const children = await db.category.findMany({
    where: { parentId },
    select: { id: true },
  })
  
  if (children.length === 0) return []
  
  const childIds = children.map(c => c.id)
  // Chama a própria função para buscar os filhos dos filhos
  const descendants = await Promise.all(childIds.map(id => getAllDescendantIds(id)))
  
  return [...childIds, ...descendants.flat()]
}

// ── FUNÇÃO ATUALIZADA: Resolve o nível atual e pega todos os descendentes ──
async function resolveCategoryIds(dept?: string, cat?: string, sub?: string): Promise<string[]> {
  if (!dept) return []

  const deptRecord = await db.category.findFirst({
    where: { slug: dept, parentId: null },
    select: { id: true },
  })
  if (!deptRecord) return []

  let targetId = deptRecord.id

  if (cat) {
    const catRecord = await db.category.findFirst({
      where: { name: { equals: cat, mode: 'insensitive' }, parentId: deptRecord.id },
      select: { id: true },
    })
    
    if (catRecord) {
      targetId = catRecord.id
      
      if (sub) {
        const subRecord = await db.category.findFirst({
          where: { name: { equals: sub, mode: 'insensitive' }, parentId: catRecord.id },
          select: { id: true },
        })
        if (subRecord) {
          targetId = subRecord.id
        }
      }
    }
  }

  // Agora, a partir do nível que o usuário parou, puxamos todos os galhos abaixo dele!
  const descendantIds = await getAllDescendantIds(targetId)
  
  return [targetId, ...descendantIds]
}

async function buildBreadcrumbs(dept?: string, cat?: string, sub?: string) {
  const crumbs: { label: string; href: string }[] = []
  if (!dept) return crumbs

  const deptRecord = await db.category.findFirst({
    where: { slug: dept, parentId: null },
    select: { name: true },
  })
  if (!deptRecord) return crumbs
  crumbs.push({ label: deptRecord.name, href: `/search?dept=${dept}` })
  if (!cat) return crumbs

  crumbs.push({ label: cat, href: `/search?dept=${dept}&cat=${encodeURIComponent(cat)}` })
  if (!sub) return crumbs

  crumbs.push({ label: sub, href: `/search?dept=${dept}&cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(sub)}` })
  return crumbs
}

async function buildPills(dept?: string, cat?: string, sub?: string) {
  if (!dept || sub) return []

  const deptRecord = await db.category.findFirst({
    where: { slug: dept, parentId: null },
    select: { id: true },
  })
  if (!deptRecord) return []

  if (!cat) {
    const cats = await db.category.findMany({
      where: { parentId: deptRecord.id },
      select: { name: true },
      orderBy: { sortOrder: 'asc' },
    })
    return cats.map((c) => ({ name: c.name, href: `/search?dept=${dept}&cat=${encodeURIComponent(c.name)}` }))
  }

  const catRecord = await db.category.findFirst({
    where: { name: { equals: cat, mode: 'insensitive' }, parentId: deptRecord.id },
    select: { id: true },
  })
  if (!catRecord) return []

  const subcats = await db.category.findMany({
    where: { parentId: catRecord.id },
    select: { name: true },
    orderBy: { sortOrder: 'asc' },
  })
  return subcats.map((s) => ({
    name: s.name,
    href: `/search?dept=${dept}&cat=${encodeURIComponent(cat)}&sub=${encodeURIComponent(s.name)}`,
  }))
}

export default async function SearchPage({ searchParams }: PageProps) {
  const sp = await searchParams

  const q = sp.q ?? ''
  const dept = sp.dept
  const cat = sp.cat
  const sub = sp.sub
  const brand = sp.brand
  const condition = sp.condition as ListingCondition | undefined
  const minPriceCents = sp.minPrice ? Math.round(parseFloat(sp.minPrice) * 100) : undefined
  const maxPriceCents = sp.maxPrice ? Math.round(parseFloat(sp.maxPrice) * 100) : undefined
  const newness = sp.newness ? parseInt(sp.newness) : undefined
  const sort = sp.sort ?? 'recent'

  const isEmptyQuery = Object.keys(sp).length === 1 && 'q' in sp && !sp.q
  const isSearchEmpty = Object.keys(sp).length === 0 || isEmptyQuery

  const session = await auth()
  const selfId = session?.user?.id

  const whereBase = {
    status: ListingStatus.ACTIVE,
  }
  
  const whereBaseFiltered = {
    ...whereBase,
    ...(selfId && { NOT: { sellerId: selfId } }),
  }

  // Busca SEMPRE as top marcas (independente se é vitrine ou resultados)
  const brandGroups = await db.listing.groupBy({
    by: ['brand'],
    where: { ...whereBaseFiltered, brand: { not: null } },
    _count: { brand: true },
    orderBy: { _count: { brand: 'desc' } },
    take: 15,
  })

  const topBrands = brandGroups
    .map((g) => g.brand)
    .filter((b): b is string => typeof b === 'string' && b.trim() !== '')

  // Se a busca estiver vazia, retorna a vitrine com as topBrands
  if (isSearchEmpty) {
    return <SearchVitrine topBrands={topBrands} />
  }

  // Se não estiver vazia, continua o processamento para a página de resultados
  const [categoryIds, breadcrumbs, pills] = await Promise.all([
    resolveCategoryIds(dept, cat, sub),
    buildBreadcrumbs(dept, cat, sub),
    buildPills(dept, cat, sub),
  ])

  const newerThan = newness
    ? new Date(Date.now() - newness * 24 * 60 * 60 * 1000)
    : undefined

  // Base where — sem filtro de condição (para facets corretos)
  const whereBaseForResults = {
    status: ListingStatus.ACTIVE,
    ...(categoryIds.length > 0 && { categoryId: { in: categoryIds } }),
    ...(brand && { brand: { equals: brand, mode: 'insensitive' as const } }),
    ...(newerThan && { createdAt: { gte: newerThan } }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
        { brand: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  }

  // Where completo — com condição e faixa de preço
  const where = {
    ...whereBaseForResults,
    ...(condition && { condition }),
    ...((minPriceCents !== undefined || maxPriceCents !== undefined) && {
      priceCents: {
        ...(minPriceCents !== undefined && { gte: minPriceCents }),
        ...(maxPriceCents !== undefined && { lte: maxPriceCents }),
      },
    }),
  }

  const orderBy =
    sort === 'price_asc' || sort === 'discount' ? { priceCents: 'asc' as const } :
    sort === 'price_desc' ? { priceCents: 'desc' as const } :
    sort === 'popular' ? { viewsCount: 'desc' as const } :
    { createdAt: 'desc' as const }

  const whereBaseFilteredForResults = {
    ...whereBaseForResults,
    ...(selfId && { NOT: { sellerId: selfId } }),
  }
  const whereFiltered = {
    ...where,
    ...(selfId && { NOT: { sellerId: selfId } }),
  }

  const [rawListings, conditionFacets] = await Promise.all([
    db.listing.findMany({
      where: whereFiltered,
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
      orderBy,
      take: 60,
    }),
    db.listing.groupBy({
      by: ['condition'],
      where: whereBaseFilteredForResults,
      _count: { condition: true },
    }),
  ])

  const favoriteIds = selfId
    ? await db.favorite
        .findMany({ where: { userId: selfId }, select: { listingId: true } })
        .then((favs) => favs.map((f) => f.listingId))
    : []

  const listings: ListingWithDetails[] = rawListings
  const availableConditions = conditionFacets.map((f) => f.condition)

  return (
    <div className="max-w-screen-xl mx-auto px-0 py-0">
      <SearchPageClient
        listings={listings}
        favoriteIds={favoriteIds}
        breadcrumbs={breadcrumbs}
        pills={pills}
        brands={topBrands}
        availableConditions={availableConditions}
        totalCount={rawListings.length}
        currentParams={sp}
      />
    </div>
  )
}