import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ListingStatus } from "@prisma/client"
import { MegaNav } from "@/components/layout/MegaNav"

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
    by: ["brand"],
    where: {
      status: ListingStatus.ACTIVE,
      brand: { not: null },
      categoryId: { in: allIds },
    },
    _count: { brand: true },
    orderBy: { _count: { brand: "desc" } },
    take: limit,
  })

  return groups
    .map((g) => g.brand)
    .filter((b): b is string => typeof b === "string" && b.trim() !== "")
}

interface Props {
  unreadCount?: number
}

export async function Header({ unreadCount }: Props) {
  const session = await auth()

  const [mocasBrands, rapazesBrands, criancasBrands, outrosBrands] = await Promise.all([
    getBrandsForDepts(["moças"]),
    getBrandsForDepts(["rapazes"]),
    getBrandsForDepts(["crianças"]),
    getBrandsForDepts(["casa e decor", "eletrônicos", "eletrodomésticos", "livros e papelarias", "pets", "etc e tal", "antiguidades"]),
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
      />
    </header>
  )
}
