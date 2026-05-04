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
      select: { code: true, status: true, shippingMethod: true, createdAt: true },
    })

    if (found) {
      lot = {
        code: found.code,
        status: found.status,
        shippingMethod: found.shippingMethod,
        createdAt: found.createdAt.toISOString(),
      }
    }
  }

  return <ProDashboardClient lot={lot} />
}
