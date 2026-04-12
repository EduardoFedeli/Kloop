import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import { ListingForm } from "@/components/listing/ListingForm"
import { createListingAction } from "@/lib/actions/listing"
import type { CategoryOption } from "@/types/listing"

export default async function CreateListingPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const userId = session.user.id

  const [subscription, categories, activeCount] = await Promise.all([
    db.userSubscription.findUnique({
      where: { userId },
      include: { plan: { select: { name: true, maxActiveListings: true } } },
    }),
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    db.listing.count({ where: { sellerId: userId, status: "ACTIVE" } }),
  ])

  const maxListings = subscription?.plan?.maxActiveListings ?? 5
  const planName = subscription?.plan?.name ?? "Free"
  const hasReachedLimit = maxListings !== -1 && activeCount >= maxListings

  const categoryOptions: CategoryOption[] = categories

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <h1 className="text-2xl font-black text-airforce mb-2">Criar anúncio</h1>
      <p className="text-sm text-teal-muted mb-6">
        {maxListings === -1
          ? "Anúncios ilimitados no seu plano"
          : `${activeCount} de ${maxListings} anúncios ativos`}
      </p>

      {hasReachedLimit ? (
        <div className="bg-white rounded-2xl p-8 border border-teal-muted/20 text-center space-y-4">
          <p className="text-base font-semibold text-airforce">
            Você atingiu o limite de {maxListings} anúncios do plano {planName}.
          </p>
          <p className="text-sm text-teal-muted">
            Faça upgrade para publicar mais anúncios sem limites.
          </p>
          <Link
            href="/plans"
            className="inline-block px-6 py-3 bg-airforce text-white font-bold rounded-full hover:bg-teal transition-colors"
          >
            Ver planos
          </Link>
        </div>
      ) : (
        <ListingForm categories={categoryOptions} action={createListingAction} />
      )}
    </div>
  )
}
