import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { updateListingAction } from "@/lib/actions/listing"
import { ListingForm } from "@/components/listing/ListingForm"
import type { CategoryOption } from "@/types/listing"

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditListingPage({ params }: Props) {
  const { slug } = await params

  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const [listing, categories] = await Promise.all([
    db.listing.findUnique({
      where: { slug },
      include: { images: { orderBy: { displayOrder: "asc" } } },
    }),
    db.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ])

  if (!listing) notFound()

  if (listing.sellerId !== session.user.id) redirect("/dashboard")

  if (listing.status === "SOLD") redirect(`/listing/${slug}`)

  const initialData = {
    title: listing.title,
    description: listing.description,
    priceCents: listing.priceCents,
    categoryId: listing.categoryId,
    condition: listing.condition,
    brand: listing.brand,
    size: listing.size,
    imageUrls: listing.images.map((img) => img.url),
  }

  const categoryOptions: CategoryOption[] = categories

  const action = updateListingAction.bind(null, listing.id)

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <h1 className="text-2xl font-black text-airforce mb-2">editar anúncio</h1>
      <p className="text-sm text-teal-muted mb-6">
        Atualize as informações do seu anúncio abaixo.
      </p>
      <ListingForm
        action={action}
        initialData={initialData}
        categories={categoryOptions}
        submitLabel="Salvar alterações"
      />
    </div>
  )
}
