import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { LoteDetailClient } from "@/components/admin/LoteDetailClient"

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminLoteDetailPage({ params }: Props) {
  const { id } = await params

  const lot = await db.proLot.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      items: { orderBy: { createdAt: "asc" } },
    },
  })

  if (!lot) notFound()

  const lotData = {
    id: lot.id,
    code: lot.code,
    status: lot.status,
    shippingMethod: lot.shippingMethod,
    withBag: lot.withBag,
    createdAt: lot.createdAt.toISOString(),
    user: lot.user,
    items: lot.items.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      condition: item.condition,
      status: item.status,
      suggestedPriceCents: item.suggestedPriceCents,
      adminNote: item.adminNote,
    })),
  }

  return <LoteDetailClient lot={lotData} />
}
