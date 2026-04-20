import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { CreateListingForm } from "@/components/listing/CreateListingForm"

export default async function CreateListingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const userId = session.user.id

  const [subscription, activeCount] = await Promise.all([
    db.userSubscription.findUnique({
      where: { userId },
      include: { plan: { select: { name: true, maxActiveListings: true } } },
    }),
    db.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
  ])

  const maxListings = subscription?.plan?.maxActiveListings ?? 5
  const planName = subscription?.plan?.name ?? "Free"

  return (
    <div className="max-w-2xl mx-auto pb-8 px-4">
      <h1 className="text-2xl font-black text-airforce mb-1">O que você quer fazer?</h1>
      <p className="text-sm text-teal-muted mb-6">
        {maxListings === -1
          ? "Anúncios ilimitados no seu plano"
          : `${activeCount} de ${maxListings} anúncios ativos`}
      </p>
      <CreateListingForm
        activeCount={activeCount}
        maxListings={maxListings}
        planName={planName}
      />
    </div>
  )
}
