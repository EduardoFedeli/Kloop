import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { CreateListingForm } from "@/components/listing/CreateListingForm"
import { requireAddress } from "@/lib/guards/require-address"
import { getUserCommunities } from "@/lib/data/communities"

export default async function CreateListingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  await requireAddress("/create")

  const userId = session.user.id

  const [subscription, activeCount, categories, brands, userCommunities] = await Promise.all([
    db.userSubscription.findUnique({
      where: { userId },
      include: { plan: { select: { name: true, maxActiveListings: true } } },
    }),
    db.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
    db.category.findMany({
      select: { id: true, name: true, parentId: true },
      orderBy: [{ parentId: "asc" }, { sortOrder: "asc" }],
    }),
    db.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    getUserCommunities(userId),
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
        categories={categories}
        brands={brands}
        userCommunities={userCommunities.map((c) => ({
          id: c.id,
          name: c.name,
          unitNumber: c.unitNumber,
        }))}
      />
    </div>
  )
}