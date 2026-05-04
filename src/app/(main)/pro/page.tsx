import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ProLandingClient } from "@/components/pro/ProLandingClient"

export const metadata = {
  title: "Kloop Pro | Kloop",
}

export default async function ProPage() {
  const session = await auth()

  let planSlug = "basic"
  let hasActiveLot = false

  if (session?.user?.id) {
    const [subscription, activeLot] = await Promise.all([
      db.userSubscription.findUnique({
        where: { userId: session.user.id },
        select: { plan: { select: { slug: true } } },
      }),
      db.proLot.findFirst({
        where: {
          userId: session.user.id,
          status: { in: ["PENDING", "RECEIVED", "ANALYZING", "ACTIVE"] },
        },
        select: { id: true },
      }),
    ])

    if (subscription?.plan?.slug) planSlug = subscription.plan.slug
    hasActiveLot = activeLot !== null
  }

  return <ProLandingClient planSlug={planSlug} hasActiveLot={hasActiveLot} />
}
