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
  let userAddress = null

  if (session?.user?.id) {
    const [user, activeLot] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { 
          subscription: { select: { plan: { select: { slug: true } } } },
          // Pega apenas os campos necessários do primeiro endereço
          addresses: {
            orderBy: { createdAt: 'asc' },
            take: 1,
            select: {
              label: true,
              street: true,
              number: true,
              complement: true,
              neighborhood: true,
              city: true,
              state: true,
              zipCode: true
            }
          }
        },
      }),
      db.proLot.findFirst({
        where: {
          userId: session.user.id,
          status: { in: ["PENDING", "RECEIVED", "ANALYZING", "ACTIVE"] },
        },
        select: { id: true },
      }),
    ])

    if (user?.subscription?.plan?.slug) planSlug = user.subscription.plan.slug
    if (user?.addresses && user.addresses.length > 0) userAddress = user.addresses[0]
    hasActiveLot = activeLot !== null
  }

  return <ProLandingClient planSlug={planSlug} hasActiveLot={hasActiveLot} address={userAddress} />
}