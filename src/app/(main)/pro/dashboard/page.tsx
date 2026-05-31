import { ProDashboardClient } from "@/components/pro/ProDashboardClient"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const metadata = {
  title: "Meu Painel Kloop Pro | Kloop",
}

export default async function ProDashboardPage() {
  const session = await auth()

  let lot = null

  if (session?.user?.id) {
    const found = await db.proLot.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "RECEIVED", "ANALYZING", "ACTIVE"] },
      },
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          select: {
            id: true,
            name: true,
            condition: true,
            status: true,
            suggestedPriceCents: true,
            adminNote: true,
            userDecision: true,
            shopProduct: { select: { id: true } },
          },
        },
      },
    })

    if (found) {
      const approvedPending = found.items.filter(
        (i) => i.status === "APPROVED" && !i.shopProduct && !i.userDecision
      )
      const published = found.items.filter((i) => i.status === "APPROVED" && i.shopProduct)
      const rejected = found.items.filter((i) => i.status === "REJECTED")

      lot = {
        code: found.code,
        status: found.status,
        shippingMethod: found.shippingMethod,
        createdAt: found.createdAt.toISOString(),
        itemsTotal: found.items.length,
        itemsApproved: found.items.filter((i) => i.status === "APPROVED").length,
        itemsPublished: published.length,
        itemsRejected: rejected.length,
        approvedItems: approvedPending.map((i) => ({
          id: i.id,
          name: i.name,
          condition: i.condition,
          suggestedPriceCents: i.suggestedPriceCents,
        })),
        rejectedItems: rejected.map((i) => ({
          id: i.id,
          name: i.name,
          adminNote: i.adminNote,
          userDecision: i.userDecision,
        })),
      }
    }
  }

  return <ProDashboardClient lot={lot} />
}
