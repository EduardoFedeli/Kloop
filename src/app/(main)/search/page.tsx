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

async function resolveCategoryIds(dept?: string, cat?: string, sub?: string): Promise<string[]> {
  if (!dept) return []

  const deptRecord = await db.category.findFirst({
    where: { slug: dept, parentId: null },
    select: { id: true },
  })
  if (!deptRecord) return []

  if (!cat) {
    const cats = await db.category.findMany({ where: { parentId: deptRecord.id }, select: { id: true } })
    const catIds = cats.map((c) => c.id)
    const subcats = catIds.length > 0
      ? await db.category.findMany({ where: { parentId: { in: catIds } }, select: { id: true } })
      : []
    return [deptRecord.id, ...catIds, ...subcats.map((s) => s.id)]
  }

  const catRecord = await db.category.findFirst({
    where: { name: { equals: cat, mode: 'insensitive' }, parentId: deptRecord.id },
    select: { id: true },
  })
  if (!catRecord) return [deptRecord.id]

  if (!sub) {
    const subcats = await db.category.findMany({ where: { parentId: catRecord.id }, select: { id: true } })
    return [catRecord.id, ...subcats.map((s) => s.id)]
  }

  const subRecord = await db.category.findFirst({
    where: { name: { equals: sub, mode: 'insensitive' }, parentId: catRecord.id },
    select: { id: true },
  })
  return subRecord ? [subRecord.id] : [catRecord.id]
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

  // ── Lógica de Decisão: Vitrine vs Resultados ──
  // Se não houver nenhum query param (ex: acessou apenas /search), mostra a Vitrine.
  const hasSearchParams = Object.keys(sp).length > 0
  const isSearchEmpty = !hasSearchParams || (Object.keys(sp).length === 1 && q === '')

  if (isSearchEmpty) {
    return <SearchVitrine />
  }

  const [categoryIds, breadcrumbs, pills] = await Promise.all([
    resolveCategoryIds(dept, cat, sub),
    buildBreadcrumbs(dept, cat, sub),
    buildPills(dept, cat, sub),
  ])

  const newerThan = newness
    ? new Date(Date.now() - newness * 24 * 60 * 60 * 1000)
    : undefined

  // Base where — sem filtro de condição (para facets corretos)
  const whereBase = {
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
    ...whereBase,
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

  const [rawListings, brandGroups, conditionFacets, session] = await Promise.all([
    db.listing.findMany({
      where,
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
    // Marcas disponíveis no contexto atual (sem filtro de brand)
    db.listing.groupBy({
      by: ['brand'],
      where: { ...whereBase, brand: { not: null } },
      _count: { brand: true },
      orderBy: { _count: { brand: 'desc' } },
      take: 15,
    }),
    // Condições com produtos — usadas para mostrar apenas filtros válidos
    db.listing.groupBy({
      by: ['condition'],
      where: whereBase,
      _count: { condition: true },
    }),
    auth(),
  ])

  const favoriteIds = session?.user?.id
    ? await db.favorite
        .findMany({ where: { userId: session.user.id }, select: { listingId: true } })
        .then((favs) => favs.map((f) => f.listingId))
    : []

  const listings: ListingWithDetails[] = rawListings
  const brands = brandGroups
    .map((g) => g.brand)
    .filter((b): b is string => typeof b === 'string' && b.trim() !== '')
  const availableConditions = conditionFacets.map((f) => f.condition)

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-6">
      <SearchPageClient
        listings={listings}
        favoriteIds={favoriteIds}
        breadcrumbs={breadcrumbs}
        pills={pills}
        brands={brands}
        availableConditions={availableConditions}
        totalCount={rawListings.length}
        currentParams={sp}
      />
    </div>
  )
}