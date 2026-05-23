import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ListingStatus } from "@prisma/client"
import { MegaNav } from "@/components/layout/MegaNav"
import { getUserCommunitiesCount } from "@/lib/data/communities"

async function getBrandsForDepts(deptNames: string[], limit = 7): Promise<string[]> {
  const depts = await db.category.findMany({
    where: { name: { in: deptNames }, parentId: null },
    select: { id: true },
  })
  if (depts.length === 0) return []

  const deptIds = depts.map((d) => d.id)

  const cats = await db.category.findMany({
    where: { parentId: { in: deptIds } },
    select: { id: true },
  })
  const catIds = cats.map((c) => c.id)

  const subcats = catIds.length > 0
    ? await db.category.findMany({ where: { parentId: { in: catIds } }, select: { id: true } })
    : []

  const allIds = [...deptIds, ...catIds, ...subcats.map((c) => c.id)]
  if (allIds.length === 0) return []

  const groups = await db.listing.groupBy({
    by: ["brandId"],
    where: {
      status: ListingStatus.ACTIVE,
      brandId: { not: null },
      categoryId: { in: allIds },
    },
    _count: { brandId: true },
    orderBy: { _count: { brandId: "desc" } },
    take: limit,
  })

  const brandIds = groups.map((g) => g.brandId).filter((id): id is string => id !== null)
  if (brandIds.length === 0) return []

  const brands = await db.brand.findMany({
    where: { id: { in: brandIds } },
    select: { id: true, name: true },
  })

  const brandNameById = new Map(brands.map((b) => [b.id, b.name]))
  return brandIds.map((id) => brandNameById.get(id)).filter((n): n is string => !!n)
}

interface Props {
  unreadCount?: number
}

export async function Header({ unreadCount }: Props) {
  const session = await auth()

  const userId = session?.user?.id

  const [mocasBrands, rapazesBrands, criancasBrands, outrosBrands, communitiesCount] = await Promise.all([
    getBrandsForDepts(["moças"]),
    getBrandsForDepts(["rapazes"]),
    getBrandsForDepts(["crianças"]),
    getBrandsForDepts(["casa e decor", "eletrônicos", "eletrodomésticos", "livros e papelarias", "pets", "etc e tal", "antiguidades"]),
    userId ? getUserCommunitiesCount(userId) : Promise.resolve(0),
  ])

  return (
    <header className="sticky top-0 z-50 bg-[var(--background)] border-b border-gray-100 dark:border-white/5">
      <MegaNav
        brands={{
          mocas: mocasBrands,
          rapazes: rapazesBrands,
          criancas: criancasBrands,
          outros: outrosBrands,
        }}
        user={session?.user ?? undefined}
        unreadCount={unreadCount}
        communitiesCount={communitiesCount}
      />
    </header>
  )
}
