import { db } from "@/lib/db"
import { KloopShopClient } from "@/components/admin/KloopShopClient"

export const metadata = { title: "Kloop Shop — Admin Kloop" }

export default async function KloopShopPage() {
  const products = await db.kloopShopProduct.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
      condition: true,
      isActive: true,
      createdAt: true,
      soldAt: true,
      consignorPayoutCents: true,
    },
  })

  const serialized = products.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    soldAt: p.soldAt ? p.soldAt.toISOString() : null,
  }))

  return <KloopShopClient products={serialized} />
}
